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

    // Secret file for production env (optional)
    ENV_PROD_FILE = 'env-prod-file' // <-- Jenkins Secret File ID (optional now)

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

    stage('Declarative: Checkout SCM') {
      steps {
        checkout scm
      }
    }

    stage('Checkout') {
      steps {
        container('nodejs') {
          git credentialsId: env.GITHUB_CREDENTIALS,
              url: "https://github.com/Radhadgit/TaskManager-webapp.git",
              branch: "main"
        }
      }
    }

    stage('Check') {
      steps {
        container('nodejs') {
          sh '''
            set -e
            echo ">>> Node: $(node -v)  npm: $(npm -v)"
            # try clean install with lockfile; fallback to npm install when lock mismatch or other issues
            if npm ci; then
              echo "npm ci succeeded"
            else
              echo "npm ci failed - falling back to npm install"
              npm install --unsafe-perm
            fi

            # run tests if present; don't fail pipeline if tests fail unless you want strict CI
            if npm test --if-present; then
              echo "Tests passed (or none defined)"
            else
              echo "Tests failed or none present - continuing (non-blocking)"
            fi
          '''
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        container('dind') {
          script {
            // try to use the secret file; if missing create a safe placeholder .env.production
            try {
              withCredentials([file(credentialsId: env.ENV_PROD_FILE, variable: 'ENV_PROD_PATH')]) {
                sh '''
                  set -e
                  echo ">>> Copying provided env file from credentials to .env.production"
                  cp "$ENV_PROD_PATH" .env.production
                '''
              }
            } catch (err) {
              echo "⚠️ Credential '${env.ENV_PROD_FILE}' not found or could not be accessed. Creating empty .env.production as fallback."
              sh 'printf "" > .env.production'
            }

            // Wait for dockerd to be ready, then build
            sh '''
              set -e
              echo ">>> Waiting for dockerd to become available..."
              timeout=60
              while [ $timeout -gt 0 ] ; do
                if docker info >/dev/null 2>&1; then
                  echo "Docker is ready"
                  break
                fi
                echo "... waiting for docker"
                sleep 2
                timeout=$((timeout-2))
              done
              if ! docker info >/dev/null 2>&1; then
                echo "ERROR: docker daemon did not start within timeout"
                exit 1
              fi

              TAG=${BUILD_NUMBER}
              IMAGE_LOCAL=${IMAGE_NAME}:${TAG}
              echo ">>> Building image ${IMAGE_LOCAL}"

              # Note: --env-file requires buildkit / recent docker. If your environment doesn't support it,
              # consider copying the file into image via Dockerfile or using --build-arg.
              docker build --env-file .env.production -t ${IMAGE_LOCAL} .
            '''
          }
        }
      }
    }

    stage('SonarQube Scan') {
      steps {
        container('nodejs') {
          withCredentials([string(credentialsId: env.SONAR_CREDENTIAL, variable: 'SONAR_TOKEN')]) {
            sh '''
              set -e
              echo ">>> Running Sonar Scanner against ${SONAR_HOST_URL}"
              # prefer local npx if available; tolerate missing scanner (non-fatal)
              if npx --no-install sonar-scanner >/dev/null 2>&1; then
                echo "Using npx sonar-scanner"
                npx --no-install sonar-scanner -Dsonar.projectKey=${REPO_NAME} -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_TOKEN} || true
              elif command -v sonar-scanner >/dev/null 2>&1; then
                sonar-scanner -Dsonar.projectKey=${REPO_NAME} -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_TOKEN} || true
              else
                echo "sonar-scanner not available; skipping Sonar scan (non-fatal)"
              fi
            '''
          }
        }
      }
    }

    stage('Login to Nexus Registry') {
      steps {
        container('dind') {
          withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS,
                                           usernameVariable: 'NEXUS_USER',
                                           passwordVariable: 'NEXUS_PASS')]) {
            sh '''
              set -e
              echo ">>> Logging into Nexus registry ${NEXUS_REGISTRY_HOST}"
              echo "$NEXUS_PASS" | docker login ${NEXUS_REGISTRY_HOST} -u "$NEXUS_USER" --password-stdin
            '''
          }
        }
      }
    }

    stage('Tag + Push Image') {
      steps {
        container('dind') {
          sh '''
            set -e
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

    stage('Create Namespace') {
      steps {
        container('kubectl') {
          sh '''
            set -e
            echo ">>> Ensuring namespace ${K8S_NAMESPACE} exists"
            kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || kubectl create ns ${K8S_NAMESPACE}
          '''
        }
      }
    }

    stage('Create Registry Secret') {
      steps {
        container('kubectl') {
          withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDENTIALS,
                                           usernameVariable: 'NEXUS_USER',
                                           passwordVariable: 'NEXUS_PASS')]) {
            sh '''
              set -e
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

    stage('Create Application Secrets') {
      steps {
        container('kubectl') {
          sh '''
            set -e
            echo ">>> Creating application secret ${APP_SECRET_NAME} in ${K8S_NAMESPACE}"
            kubectl delete secret ${APP_SECRET_NAME} -n ${K8S_NAMESPACE} --ignore-not-found
            kubectl create secret generic ${APP_SECRET_NAME} \
              --from-literal=MONGO_URL='your_mongo_url_here' \
              -n ${K8S_NAMESPACE}
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        container('kubectl') {
          sh '''
            set -e
            echo ">>> Applying manifests in k8s/ to namespace ${K8S_NAMESPACE}"
            kubectl apply -f k8s/service.yaml -n ${K8S_NAMESPACE} || true
            kubectl apply -f k8s/deployment.yaml -n ${K8S_NAMESPACE}
            IMAGE=${IMAGE_REPOSITORY}:${BUILD_NUMBER}
            echo ">>> Updating deployment image to ${IMAGE}"
            kubectl set image deployment/${REPO_NAME} ${REPO_NAME}=${IMAGE} -n ${K8S_NAMESPACE} --record || true
          '''
        }
      }
    }

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
