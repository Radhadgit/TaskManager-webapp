pipeline {
  agent {
    kubernetes {
      label 'taskmanager-agent'
      defaultContainer 'nodejs'
      yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: taskmanager-agent
spec:
  containers:
  - name: nodejs
    image: node:18
    command: ["cat"]
    tty: true
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  - name: dind
    image: docker:24-dind
    securityContext:
      privileged: true
    command: ["dockerd-entrypoint.sh"]
    args: ["--host=tcp://0.0.0.0:2375", "--host=unix:///var/run/docker.sock"]
    tty: true
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume
      - mountPath: /var/lib/docker
        name: docker-data

  - name: kubectl
    image: lachlanevenson/k8s-kubectl:latest
    command: ["cat"]
    tty: true
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  - name: jnlp
    image: jenkins/inbound-agent:latest
    tty: true
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  volumes:
    - name: workspace-volume
      emptyDir: {}
    - name: docker-data
      emptyDir: {}
"""
    }
  }

  environment {
    // Credentials (IDs must exist in Jenkins Credentials)
    GITHUB_CREDENTIALS = 'github-2401041'
    NEXUS_CREDENTIALS  = 'nexus-41'
    SONAR_CREDENTIAL   = 'sonar-token-2401041'

    // Secret file for production env
    ENV_PROD_FILE = 'env-prod-file' // <-- Jenkins Secret File ID

    // Registry & project settings
    NEXUS_REGISTRY_HOST = "nexus.imcc.com"
    NEXUS_URL = "http://nexus.imcc.com"
    REPO_NAME = "taskmanager-webapp"
    IMAGE_NAME = "${REPO_NAME}"
    IMAGE_REPOSITORY = "${NEXUS_REGISTRY_HOST}/repository/docker-hosted/${REPO_NAME}"

    // Sonar
    SONAR_HOST_URL = "http://sonarqube.imcc.com"

    // Kubernetes
    K8S_NAMESPACE = "taskmanager"
    REGISTRY_SECRET_NAME = "nexus-secret"
    APP_SECRET_NAME = "app-secret"
  }

  stages {

    /**************************************************************
     * 0 - Declarative: Checkout SCM
     *************************************************************/
    stage('Declarative: Checkout SCM') {
      steps {
        checkout scm
      }
    }

    /**************************************************************
     * 1 - Explicit Checkout
     *************************************************************/
    stage('Checkout') {
      steps {
        container('nodejs') {
          git credentialsId: env.GITHUB_CREDENTIALS,
              url: "https://github.com/Radhadgit/TaskManager-webapp.git",
              branch: "main"
        }
      }
    }

    /**************************************************************
     * 2 - Check (install dependencies & run tests)
     *************************************************************/
    stage('Check') {
      steps {
        container('nodejs') {
          sh '''
            echo ">>> Node: $(node -v)  npm: $(npm -v)"
            npm ci || npm install --unsafe-perm
            npm test --if-present || echo "No tests or tests failed (non-blocking)"
          '''
        }
      }
    }

    /**************************************************************
     * 3 - Build Docker Image (with .env.production)
     *************************************************************/
    stage('Build Docker Image') {
      steps {
        container('dind') {
          withCredentials([file(credentialsId: env.ENV_PROD_FILE, variable: 'ENV_PROD_PATH')]) {
            sh '''
              set -e
              echo ">>> Waiting for dockerd to become available..."
              timeout=60
              while [ $timeout -gt 0 ] ; do
                if docker info >/dev/null 2>&1; then
                  echo "Docker is ready"
                  break
                fi
                echo "Waiting for docker..."
                sleep 2
                timeout=$((timeout-2))
              done
              if ! docker info >/dev/null 2>&1; then
                echo "ERROR: docker daemon did not start"
                exit 1
              fi

              TAG=${BUILD_NUMBER}
              IMAGE_LOCAL=${IMAGE_NAME}:${TAG}
              echo ">>> Building image $IMAGE_LOCAL"

              # Copy Jenkins secret env file to workspace
              cp $ENV_PROD_PATH .env.production

              # Build Docker image with env-file
              docker build --env-file .env.production -t $IMAGE_LOCAL .
            '''
          }
        }
      }
    }

    /**************************************************************
     * 4 - SonarQube Scan
     *************************************************************/
    stage('SonarQube Scan') {
      steps {
        container('nodejs') {
          withCredentials([string(credentialsId: env.SONAR_CREDENTIAL, variable: 'SONAR_TOKEN')]) {
            sh '''
              echo ">>> Running Sonar Scanner against ${SONAR_HOST_URL}"
              npx --no-install sonar-scanner || sonar-scanner || true
              if command -v sonar-scanner >/dev/null 2>&1; then
                sonar-scanner -Dsonar.projectKey=${REPO_NAME} -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_TOKEN}
              else
                echo "sonar-scanner not installed; skipping detailed scan"
              fi
            '''
          }
        }
      }
    }

    /**************************************************************
     * 5 - Login to Nexus Registry
     *************************************************************/
    stage('Login to Nexus Registry') {
      steps {
        container('dind') {
          withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS,
                                           usernameVariable: 'NEXUS_USER',
                                           passwordVariable: 'NEXUS_PASS')]) {
            sh '''
              echo ">>> Logging into Nexus registry ${NEXUS_REGISTRY_HOST}"
              echo "$NEXUS_PASS" | docker login ${NEXUS_REGISTRY_HOST} -u "$NEXUS_USER" --password-stdin
            '''
          }
        }
      }
    }

    /**************************************************************
     * 6 - Tag & Push Image
     *************************************************************/
    stage('Tag + Push Image') {
      steps {
        container('dind') {
          sh '''
            TAG=${BUILD_NUMBER}
            IMAGE_LOCAL=${IMAGE_NAME}:${TAG}
            IMAGE_REMOTE=${IMAGE_REPOSITORY}:${TAG}

            echo ">>> Tagging ${IMAGE_LOCAL} -> ${IMAGE_REMOTE}"
            docker tag ${IMAGE_LOCAL} ${IMAGE_REMOTE}

            echo ">>> Pushing to ${IMAGE_REMOTE}"
            docker push ${IMAGE_REMOTE}
          '''
        }
      }
    }

    /**************************************************************
     * 7 - Create Namespace
     *************************************************************/
    stage('Create Namespace') {
      steps {
        container('kubectl') {
          sh '''
            echo ">>> Ensuring namespace ${K8S_NAMESPACE} exists"
            kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || kubectl create ns ${K8S_NAMESPACE}
          '''
        }
      }
    }

    /**************************************************************
     * 8 - Create Registry Secret
     *************************************************************/
    stage('Create Registry Secret') {
      steps {
        container('kubectl') {
          withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS,
                                           usernameVariable: 'NEXUS_USER',
                                           passwordVariable: 'NEXUS_PASS')]) {
            sh '''
              echo ">>> Creating docker-registry secret ${REGISTRY_SECRET_NAME} in ${K8S_NAMESPACE}"
              kubectl delete secret ${REGISTRY_SECRET_NAME} -n ${K8S_NAMESPACE} --ignore-not-found
              kubectl create secret docker-registry ${REGISTRY_SECRET_NAME} \
                --docker-server=${NEXUS_REGISTRY_HOST} \
                --docker-username=${NEXUS_USER} \
                --docker-password=${NEXUS_PASS} \
                -n ${K8S_NAMESPACE}
            '''
          }
        }
      }
    }

    /**************************************************************
     * 9 - Create Application Secrets
     *************************************************************/
    stage('Create Application Secrets') {
      steps {
        container('kubectl') {
          sh '''
            echo ">>> Creating application secret ${APP_SECRET_NAME} in ${K8S_NAMESPACE}"
            kubectl delete secret ${APP_SECRET_NAME} -n ${K8S_NAMESPACE} --ignore-not-found
            kubectl create secret generic ${APP_SECRET_NAME} \
              --from-literal=MONGO_URL='your_mongo_url_here' \
              -n ${K8S_NAMESPACE}
          '''
        }
      }
    }

    /**************************************************************
     * 10 - Deploy to Kubernetes
     *************************************************************/
    stage('Deploy to Kubernetes') {
      steps {
        container('kubectl') {
          sh '''
            echo ">>> Applying manifests in k8s/ to namespace ${K8S_NAMESPACE}"
            kubectl apply -f k8s/service.yaml -n ${K8S_NAMESPACE} || true
            kubectl apply -f k8s/deployment.yaml -n ${K8S_NAMESPACE}
            IMAGE=${IMAGE_REPOSITORY}:${BUILD_NUMBER}
            kubectl set image deployment/${REPO_NAME} ${REPO_NAME}=${IMAGE} -n ${K8S_NAMESPACE} --record || true
          '''
        }
      }
    }

    /**************************************************************
     * 11 - Cleanup
     *************************************************************/
    stage('Cleanup') {
      steps {
        script {
          try {
            container('nodejs') { sh 'rm -rf node_modules || true' }
          } catch (err) { echo "Could not remove node_modules: ${err}" }

          try {
            container('dind') { sh 'docker system prune -af || true' }
          } catch (err) { echo "Docker prune skipped: ${err}" }

          deleteDir()
        }
      }
    }
  }

  post {
    success {
      echo "🎉 Build, push and deploy succeeded (namespace=${K8S_NAMESPACE}, image tag=${BUILD_NUMBER})"
    }
    failure {
      echo "❌ Pipeline failed - check build log for details"
    }
    always {
      echo "Pipeline finished at: ${new Date()}"
    }
  }
}
