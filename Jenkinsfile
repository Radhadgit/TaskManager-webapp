pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: nodejs
    image: node:18-alpine
    command:
    - cat
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
    command:
    - cat
    tty: true
    securityContext:
      runAsUser: 0
      readOnlyRootFilesystem: false
    env:
    - name: KUBECONFIG
      value: /kube/config
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command:
    - cat
    tty: true

  volumes:
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        IMAGE_NAME      = "taskmanager-webapp"
        IMAGE_TAG       = "${BUILD_NUMBER}"
        REGISTRY_URL    = "nexus.imcc.com"
        REGISTRY_REPO   = "docker-repo"
        SONAR_PROJECT_KEY = "2401041-TaskManager"
        SONAR_HOST_URL    = "http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000"
        K8S_NAMESPACE     = "2401041"
        K8S_DEPLOYMENT    = "taskmanager-deployment"
    }

    stages {

        stage('Checkout Code') {
            steps {
                container('nodejs') {
                    git url: "https://github.com/Radhadgit/TaskManager-webapp.git", branch: "main"
                }
            }
        }

        stage('Install & Build') {
            steps {
                container('nodejs') {
                    sh '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Docker Build & Tag') {
            steps {
                container('dind') {
                    sh '''
                        sleep 10
                        docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                        docker image ls
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                container('nodejs') {
                    sh '''
                        echo "Skipping tests or add npm test if available"
                        # npm test
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token-2401041', variable: 'SONAR_TOKEN')]) {
                        sh '''
                            sonar-scanner \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=${SONAR_HOST_URL} \
                              -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Docker Push to Nexus') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(credentialsId: 'nexus-41', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh '''
                            docker login ${REGISTRY_URL} -u $NEXUS_USER -p $NEXUS_PASS
                            docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY_URL}/repository/${REGISTRY_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
                            docker push ${REGISTRY_URL}/repository/${REGISTRY_REPO}/${IMAGE_NAME}:${IMAGE_TAG}
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl set image deployment/${K8S_DEPLOYMENT} \
                          ${IMAGE_NAME}=${REGISTRY_URL}/repository/${REGISTRY_REPO}/${IMAGE_NAME}:${IMAGE_TAG} \
                          -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/${K8S_DEPLOYMENT} -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment succeeded: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo "❌ Deployment Failed — Check Logs!"
        }
    }
}
