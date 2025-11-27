pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'task-manager-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        NEXUS_REGISTRY = 'your-server-ip:8082'
        NEXUS_REPO = 'docker-hosted'
        DEPLOY_DIR = '/opt/task-manager'
    }

    tools {
        nodejs 'node18' // Use pre-installed Node.js
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing npm dependencies...'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo '🔍 Running linter...'
                sh 'npm run lint || true'
            }
        }

        stage('Build Next.js') {
            steps {
                echo '🏗️ Building Next.js application...'
                sh '''
                    export MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/taskmanager}
                    export JWT_SECRET=${JWT_SECRET:-build-secret-key}
                    npm run build
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                """
            }
        }

        stage('Push to Nexus') {
            when {
                branch 'main'
            }
            steps {
                echo '📤 Pushing Docker image to Nexus...'
                script {
                    withCredentials([usernamePassword(credentialsId: 'nexus-credentials', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                        sh """
                            echo \$NEXUS_PASS | docker login ${NEXUS_REGISTRY} -u \$NEXUS_USER --password-stdin
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${NEXUS_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${NEXUS_REGISTRY}/${DOCKER_IMAGE}:latest
                            docker push ${NEXUS_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker push ${NEXUS_REGISTRY}/${DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying application...'
                script {
                    withCredentials([
                        string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI'),
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
                    ]) {
                        sh """
                            sudo mkdir -p ${DEPLOY_DIR} || true
                            sudo chown -R \$USER:\$USER ${DEPLOY_DIR} || true
                            
                            if [ ! -f ${DEPLOY_DIR}/docker-compose.prod.yml ]; then
                                cp docker-compose.prod.yml ${DEPLOY_DIR}/docker-compose.prod.yml
                            fi
                            
                            cd ${DEPLOY_DIR}
                            docker-compose -f docker-compose.prod.yml down || true
                            
                            docker pull ${NEXUS_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} || true
                            
                            export MONGODB_URI=\${MONGODB_URI}
                            export JWT_SECRET=\${JWT_SECRET}
                            
                            docker-compose -f docker-compose.prod.yml up -d
                            sleep 15
                            
                            for i in {1..10}; do
                                if curl -f http://localhost:3000/api/health; then
                                    echo "✅ Health check passed!"
                                    break
                                fi
                                echo "Attempt \$i/10: Waiting for service..."
                                sleep 5
                            done
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            node {
                sh '''
                    docker images ${DOCKER_IMAGE} --format "{{.ID}}" | tail -n +6 | xargs -r docker rmi || true
                    docker image prune -f || true
                '''
                cleanWs()
            }
        }
    }
}