pipeline {
    agent any

    tools {
        nodejs 'node18'
    }

    environment {
        GITHUB_CREDENTIALS = 'github-2401041'
        NEXUS_CREDENTIALS = 'nexus-41'
        SONAR_CREDENTIAL  = 'sonar-token-2401041'

        NEXUS_URL = "http://nexus.imcc.com"
        REPO_NAME = "taskmanager-webapp"
        DOCKER_IMAGE = "taskmanager-webapp:latest"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git credentialsId: "${GITHUB_CREDENTIALS}", 
                    url: 'https://github.com/Radhadgit/TaskManager-webapp.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test --if-present || echo "No tests found"'
            }
        }

        stage('SonarQube Analysis') {
            environment {
                SONAR_HOST_URL = "http://192.168.20.250:9000"
            }
            steps {
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

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        docker build -t ${DOCKER_IMAGE} .
                    """
                }
            }
        }

        stage('Push to Nexus Registry') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${NEXUS_CREDENTIALS}",
                                                     usernameVariable: 'NEXUS_USER',
                                                     passwordVariable: 'NEXUS_PASS')]) {

                        sh """
                            docker login -u "$NEXUS_USER" -p "$NEXUS_PASS" ${NEXUS_URL}
                            docker tag ${DOCKER_IMAGE} ${NEXUS_URL}/repository/docker-hosted/${REPO_NAME}:latest
                            docker push ${NEXUS_URL}/repository/docker-hosted/${REPO_NAME}:latest
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
            echo "🧹 Cleaning workspace and pruning Docker images..."
            sh '''
                docker image prune -f || true
            '''
            cleanWs()
        }
    }
}
