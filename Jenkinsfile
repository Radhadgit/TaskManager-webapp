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

        NEXUS_USER = "admin"
        NEXUS_PASS = "Changeme@2025"

        K8S_NAMESPACE = "taskmanager"
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

                        docker build -t taskmanager-webapp:${BUILD_NUMBER} .
                        docker image ls
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=2401041-TaskManager \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://sonarqube.imcc.com \
                          -Dsonar.login=''' + SONAR_TOKEN + '''
                    '''
                }
            }
        }

        stage('Login to Nexus Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker login nexus.imcc.com -u admin -p Changeme@2025
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        docker tag taskmanager-webapp:${BUILD_NUMBER} nexus.imcc.com/repository/docker-repo/taskmanager-webapp:${BUILD_NUMBER}
                        docker push nexus.imcc.com/repository/docker-repo/taskmanager-webapp:${BUILD_NUMBER}
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
                            taskmanager-container=nexus.imcc.com/repository/docker-repo/taskmanager-webapp:${BUILD_NUMBER} \
                            -n taskmanager

                        kubectl rollout status deployment/taskmanager-app -n taskmanager
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment Successful! Image tag: ${BUILD_NUMBER}"
        }
        failure {
            echo "❌ Deployment Failed — Check Logs!"
        }
    }
}
