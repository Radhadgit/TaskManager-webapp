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
        SONAR_TOKEN = credentials('sonar-token-2401041')
        DOCKER_IMAGE = "taskmanager-webapp:latest"
        MONGO_HOST = "task-manager-mongodb"
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
                    sh '''
                        echo "Skipping tests or add 'npm test' if available"
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
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
         stage('Login to Docker Registry') {
            steps {
                container('dind') {
                    sh 'docker --version'
                    sh 'sleep 10'
                    sh 'docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 -u admin -p Changeme@2025'
                }
            }
        }
        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    sh 'docker tag taskmanager-app:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401199-project/face-detection:latest'
                    sh 'docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401041-project/taskmanager-app:latest'
                    sh 'docker pull nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401041-project/taskmanager-app:latest'
                    sh 'docker image ls'
                }
            }
        }

        stage('Push Docker Image (Optional)') {
            steps {
                container('dind') {
                    sh '''
                        echo "Docker push to Nexus/registry if configured"
                    '''
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
            cleanWs()
        }
        success {
            echo "Build completed successfully!"
        }
        failure {
            echo "Build failed. Check logs."
        }
    }
}
