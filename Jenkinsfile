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
    command:
    - cat
    tty: true
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent
  - name: dind
    image: docker:24
    securityContext:
      privileged: true
    tty: true
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent
  - name: jnlp
    image: jenkins/inbound-agent:latest
    tty: true
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent
  volumes:
  - name: workspace-volume
    emptyDir: {}
"""
        }
    }

    environment {
        GITHUB_CREDENTIALS = 'github-2401041'
        NEXUS_CREDENTIALS = 'nexus-41'
        SONAR_CREDENTIAL  = 'sonar-token-2401041'

        NEXUS_URL = "http://nexus.imcc.com"
        REPO_NAME = "taskmanager-webapp"
        DOCKER_IMAGE = "taskmanager-webapp:latest"
        SONAR_HOST_URL = "http://192.168.20.250:9000"
    }

    stages {

        stage('Checkout Code') {
            steps {
                container('nodejs') {
                    git credentialsId: "${GITHUB_CREDENTIALS}", 
                        url: 'https://github.com/Radhadgit/TaskManager-webapp.git',
                        branch: 'main'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                container('nodejs') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                container('nodejs') {
                    sh 'npm test --if-present || echo "No tests found"'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('nodejs') {
                    withCredentials([string(credentialsId: "${SONAR_CREDENTIAL}", variable: 'SONAR_TOKEN')]) {
                        sh """
                            npx sonar-scanner \
                            -Dsonar.projectKey=TaskManager-webapp \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Build Application') {
            steps {
                container('nodejs') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh "docker build -t ${DOCKER_IMAGE} ."
                }
            }
        }

        stage('Push to Nexus Registry') {
            steps {
                container('dind') {
                    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}",
                                                     usernameVariable: 'NEXUS_USER',
                                                     passwordVariable: 'NEXUS_PASS')]) {

                        sh """
                            echo \$NEXUS_PASS | docker login ${NEXUS_URL} --username \$NEXUS_USER --password-stdin
                            docker tag ${DOCKER_IMAGE} ${NEXUS_URL}/repository/docker-hosted/${REPO_NAME}:latest
                            docker push ${NEXUS_URL}/repository/docker-hosted/${REPO_NAME}:latest
                            docker logout ${NEXUS_URL}
                        """
                    }
                }
            }
        }
    }

    post {

        success {
            echo "🎉 Build completed successfully!"
        }

        failure {
            echo "❌ Build failed!"
        }

        always {
            container('dind') {
                echo "🧹 Cleaning workspace and pruning Docker images..."
                sh 'docker system prune -af || true'
            }
            container('nodejs') {
                deleteDir()  // safely clean workspace inside a container
            }
        }
    }
}
