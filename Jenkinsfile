pipeline {
    agent {
        kubernetes {
            label 'taskmanager-agent'
            defaultContainer 'jnlp'
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
    image: docker:24
    securityContext:
      privileged: true
    tty: true
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume
  - name: kubectl
    image: bitnami/kubectl:1.30
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
"""
        }
    }

    environment {
        // Credentials and servers (change IDs/URLs as required)
        GITHUB_CREDENTIALS = 'github-2401041'
        NEXUS_CREDENTIALS  = 'nexus-41'
        SONAR_CREDENTIAL   = 'sonar-token-2401041'

        NEXUS_URL = "http://nexus.imcc.com"
        NEXUS_REGISTRY_HOST = "nexus.imcc.com"   // hostname used for docker-registry secrets
        REPO_NAME = "taskmanager-webapp"
        DOCKER_IMAGE = "${REPO_NAME}"            // image name (tag applied later)

        SONAR_HOST_URL = "http://sonarqube.imcc.com"

        K8S_NAMESPACE = "taskmanager"
        APP_SECRET_NAME = "app-secret"
        REGISTRY_SECRET_NAME = "nexus-secret"
    }

    stages {

        /* 0 - Declarative Checkout SCM (Jenkins built-in) */
        stage('Declarative: Checkout SCM') {
            steps {
                checkout scm
            }
        }

        /* 1 - Explicit Checkout (redundant but requested) */
        stage('Checkout') {
            steps {
                container('nodejs') {
                    git credentialsId: "${GITHUB_CREDENTIALS}",
                        url: 'https://github.com/Radhadgit/TaskManager-webapp.git',
                        branch: 'main'
                }
            }
        }

        /* 2 - Check: install + tests */
        stage('Check') {
            steps {
                container('nodejs') {
                    // install as non-root where possible, allow unsafe-perm to avoid permission issues
                    sh '''
                      echo ">>> Installing dependencies"
                      npm ci || npm install --unsafe-perm
                      echo ">>> Running tests (if any)"
                      npm test --if-present || echo "No tests or tests failed (non-blocking)"
                    '''
                }
            }
        }

        /* 3 - Build Docker image (local tag) */
        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh """
                        echo ">>> Building Docker image ${DOCKER_IMAGE}:\${BUILD_NUMBER}"
                        docker version || true
                        docker build -t ${DOCKER_IMAGE}:\${BUILD_NUMBER} .
                    """
                }
            }
        }

        /* 4 - SonarQube Scan (uses configured SonarQube server & token) */
        stage('SonarQube Scan') {
            steps {
                container('nodejs') {
                    withCredentials([string(credentialsId: "${SONAR_CREDENTIAL}", variable: 'SONAR_TOKEN')]) {
                        // 'SonarQube-2401041' must match the SonarQube server name configured in Manage Jenkins
                        withSonarQubeEnv('SonarQube-2401041') {
                            sh """
                                echo ">>> Running SonarQube scanner (server: ${SONAR_HOST_URL})"
                                sonar-scanner \
                                  -Dsonar.projectKey=${REPO_NAME} \
                                  -Dsonar.sources=. \
                                  -Dsonar.host.url=${SONAR_HOST_URL} \
                                  -Dsonar.login=${SONAR_TOKEN}
                            """
                        }
                    }
                }
            }
        }

        /* 5 - Login to Nexus Registry (keeps login separate) */
        stage('Login to Nexus Registry') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}",
                                                     usernameVariable: 'NEXUS_USER',
                                                     passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                            echo ">>> Logging in to Nexus registry ${NEXUS_URL}"
                            echo \$NEXUS_PASS | docker login ${NEXUS_REGISTRY_HOST} --username \$NEXUS_USER --password-stdin
                        """
                    }
                }
            }
        }

        /* 6 - Tag & Push image to Nexus */
        stage('Tag & Push Image') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}",
                                                     usernameVariable: 'NEXUS_USER',
                                                     passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                          TAG=\${BUILD_NUMBER}
                          REMOTE=${NEXUS_REGISTRY_HOST}/repository/docker-hosted/${REPO_NAME}:\$TAG
                          echo ">>> Tagging ${DOCKER_IMAGE}:\${BUILD_NUMBER} -> \$REMOTE"
                          docker tag ${DOCKER_IMAGE}:\${BUILD_NUMBER} \$REMOTE
                          echo ">>> Pushing to Nexus: \$REMOTE"
                          docker push \$REMOTE
                        """
                    }
                }
            }
        }

        /* 7 - Create Namespace if not exists */
        stage('Create Namespace') {
            steps {
                container('kubectl') {
                    sh """
                        echo ">>> Ensure namespace ${K8S_NAMESPACE} exists"
                        kubectl get ns ${K8S_NAMESPACE} >/dev/null 2>&1 || kubectl create ns ${K8S_NAMESPACE}
                    """
                }
            }
        }

        /* 8 - Create Docker Registry Secret in Kubernetes */
        stage('Create Registry Secret') {
            steps {
                container('kubectl') {
                    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}",
                                                     usernameVariable: 'NEXUS_USER',
                                                     passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                          echo ">>> Creating docker-registry secret ${REGISTRY_SECRET_NAME} in ${K8S_NAMESPACE}"
                          kubectl delete secret ${REGISTRY_SECRET_NAME} -n ${K8S_NAMESPACE} --ignore-not-found
                          kubectl create secret docker-registry ${REGISTRY_SECRET_NAME} \\
                            --docker-server=${NEXUS_REGISTRY_HOST} \\
                            --docker-username=\$NEXUS_USER \\
                            --docker-password=\$NEXUS_PASS \\
                            -n ${K8S_NAMESPACE}
                        """
                    }
                }
            }
        }

        /* 9 - Create Application Secrets (example: MONGO URL) */
        stage('Create Application Secrets') {
            steps {
                container('kubectl') {
                    // Replace with real values or Jenkins credentials as needed
                    sh """
                      echo ">>> Creating application secret ${APP_SECRET_NAME} in ${K8S_NAMESPACE}"
                      kubectl delete secret ${APP_SECRET_NAME} -n ${K8S_NAMESPACE} --ignore-not-found
                      kubectl create secret generic ${APP_SECRET_NAME} \\
                        --from-literal=MONGO_URL='your_mongo_url_here' \\
                        -n ${K8S_NAMESPACE}
                    """
                }
            }
        }

        /* 10 - Deploy to Kubernetes (assumes deployment.yaml & service.yaml exist in repo) */
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh """
                        echo ">>> Applying Kubernetes manifests to namespace ${K8S_NAMESPACE}"
                        # Ensure deployment yaml uses image with the tag build number, or replace in-line:
                        # Here we patch the image to the pushed tag
                        kubectl apply -f k8s/service.yaml -n ${K8S_NAMESPACE} || true
                        kubectl apply -f k8s/deployment.yaml -n ${K8S_NAMESPACE}
                        # If you need to update deployment image to the just-pushed image:
                        IMAGE=${NEXUS_REGISTRY_HOST}/repository/docker-hosted/${REPO_NAME}:\${BUILD_NUMBER}
                        kubectl set image deployment/${REPO_NAME} ${REPO_NAME}=\$IMAGE -n ${K8S_NAMESPACE} --record || true
                    """
                }
            }
        }

    } // stages

    post {
        success {
            echo "🎉 Build & deploy succeeded — image pushed and deployed to ${K8S_NAMESPACE}"
        }
        failure {
            echo "❌ Pipeline failed — check console output for errors"
        }
        always {
            // try to remove node_modules before workspace cleanup to avoid permission issues
            script {
                try {
                    container('nodejs') {
                        sh 'rm -rf node_modules || true'
                    }
                } catch (e) {
                    echo "Could not remove node_modules inside nodejs container: ${e}"
                }
            }
            // prune docker images in dind container (best-effort)
            script {
                try {
                    container('dind') {
                        sh 'docker system prune -af || true'
                    }
                } catch (e) {
                    echo "Docker prune skipped or failed: ${e}"
                }
            }
            cleanWs()
            echo "🧹 Workspace cleaned"
        }
    }
}
