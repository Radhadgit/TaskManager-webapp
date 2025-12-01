pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: nodejs
    image: node:18
    command: ["cat"]
    tty: true

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ["cat"]
    tty: true

  - name: dind
    image: docker:24-dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    command: ["dockerd-entrypoint.sh"]
    args: ["--host=tcp://0.0.0.0:2375"]
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
    env:
    - name: KUBECONFIG
      value: /kube/config
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig

  volumes:
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        SONAR_PROJECT_KEY = "2401041-TaskManager"
        SONAR_TOKEN = credentials('sonar-token-2401041')
        SONAR_HOST_URL = "http://sonarqube.imcc.com"

        REGISTRY_URL = "nexus.imcc.com"
        REGISTRY_REPO = "docker-repo"
        IMAGE_NAME = "taskmanager-webapp"

        K8S_NAMESPACE = "taskmanager"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                container('nodejs') {
                    git url: "https://github.com/Radhadgit/TaskManager-webapp.git", branch: "main"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                container('nodejs') {
                    sh '''
                        npm install
                        echo "Node version: $(node -v)"
                        echo "NPM version: $(npm -v)"
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                container('dind') {
                    sh '''
                        echo "Waiting for Docker daemon..."
                        sleep 15
                        docker build -t ${REGISTRY_URL}/repository/${REGISTRY_REPO}/${IMAGE_NAME}:${IMAGE_TAG} .
                        docker image ls
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Login to Nexus Registry') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(credentialsId: 'nexus-41', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh '''
                            echo "Logging in to Nexus..."
                            docker login ${REGISTRY_URL} -u $NEXUS_USER -p $NEXUS_PASS
                        '''
                    }
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        docker push ${REGISTRY_URL}/repository/${REGISTRY_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        echo "Updating Deployment image..."
                        kubectl set image deployment/taskmanager-app \
                            taskmanager-container=${REGISTRY_URL}/repository/${REGISTRY_REPO}/${IMAGE_NAME}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        kubectl rollout status deployment/taskmanager-app -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment Successful! Image tag: ${IMAGE_TAG}"
        }
        failure {
            echo "❌ Deployment Failed — Check Logs!"
        }
    }
}
