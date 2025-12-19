pipeline {
    agent {
        kubernetes {
            label '2401041-taskmanager-agent'
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
    image: node:18-alpine
    command: ["cat"]
    tty: true
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  - name: dind
    image: docker:24-dind
    securityContext:
      privileged: true
    tty: true
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
    tty: true
    volumeMounts:
      - mountPath: /kube/config
        name: kubeconfig-secret
        subPath: kubeconfig
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ["cat"]
    tty: true
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  - name: jnlp
    image: jenkins/inbound-agent:3345.v03dee9b_f88fc-1
    env:
      - name: JENKINS_AGENT_WORKDIR
        value: /home/jenkins/agent
    volumeMounts:
      - mountPath: /home/jenkins/agent
        name: workspace-volume

  volumes:
    - name: workspace-volume
      emptyDir: {}
    - name: kubeconfig-secret
      secret:
        secretName: kubeconfig-secret
"""
        }
    }

    environment {
        DOCKER_IMAGE  = "2401041-taskmanager-frontend"
        REGISTRY_HOST = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REGISTRY_PATH = "2401041"
        FULL_IMAGE    = "${REGISTRY_HOST}/${REGISTRY_PATH}/${DOCKER_IMAGE}:latest"
        NAMESPACE     = "2401041"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/Radhadgit/TaskManager-webapp.git', branch: 'main'
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
                        docker build -t $DOCKER_IMAGE .
                        docker image ls
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                container('nodejs') {
                    sh 'echo "Skipping tests or add npm test"'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: '2401041-TaskManager', variable: 'SONAR_TOKEN')]) {
                        sh """
                            sonar-scanner \
                            -Dsonar.projectKey=2401041-TaskManager \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                            -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(credentialsId: '2401041', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh 'docker login $REGISTRY_HOST -u $NEXUS_USER -p $NEXUS_PASS'
                    }
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(credentialsId: '2401041', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                            docker build -t $DOCKER_IMAGE:latest .
                            docker tag $DOCKER_IMAGE:latest $FULL_IMAGE
                            docker login $REGISTRY_HOST -u $NEXUS_USER -p $NEXUS_PASS
                            docker push $FULL_IMAGE
                            docker image ls
                        """
                    }
                }
            }
        }

        stage('Deploy AI Application') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl apply -f deployment.yaml -n 2401041
                        kubectl apply -f service.yaml -n 2401041
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up workspace..."
            deleteDir()
        }

        success {
            echo "Build completed successfully!"
        }

        failure {
            echo "Build failed. Check logs."
        }
    }
}
