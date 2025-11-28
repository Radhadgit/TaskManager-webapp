pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins/label: "2401041-taskmanager-agent"
spec:
  restartPolicy: Never
  nodeSelector:
    kubernetes.io/os: "linux"
  volumes:
    - name: workspace-volume
      emptyDir: {}
    - name: kubeconfig-secret
      secret:
        secretName: kubeconfig-secret
  containers:
    - name: node
      image: node:18
      tty: true
      command: ["cat"]
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: sonar-scanner
      image: sonarsource/sonar-scanner-cli
      tty: true
      command: ["cat"]
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: dind
      image: docker:dind
      args: ["--storage-driver=overlay2"]
      securityContext:
        privileged: true
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent

    - name: jnlp
      image: jenkins/inbound-agent:3345.v03dee9b_f88fc-1
      env:
        - name: JENKINS_AGENT_NAME
          value: "2401041-taskmanager-agent"
        - name: JENKINS_AGENT_WORKDIR
          value: "/home/jenkins/agent"
      volumeMounts:
        - name: workspace-volume
          mountPath: /home/jenkins/agent
'''
        }
    }

    environment {
        // Docker Images
        CLIENT_IMAGE = "task-manager-app-2401084-cicd-main-app"  // your frontend image
        SERVER_IMAGE = "mongo:7"                                 // your backend image
        IMAGE_TAG    = "latest"

        // SonarQube
        SONAR_PROJECT_KEY   = '2401041-TaskManager'
        SONAR_HOST_URL      = 'http://sonarqube.imcc.com'
        SONAR_PROJECT_TOKEN = 'sqp_5d82297fc3610d03b74745de66b3c994b41b39b4'
    }

    stages {

        stage('Install Frontend') {
            steps {
                container('node') {
                    dir('client') {
                        sh '''
                        set -e
                        npm install
                        npm run build
                        '''
                    }
                }
            }
        }

        stage('Install Backend') {
            steps {
                container('node') {
                    dir('server') {
                        sh '''
                        set -e
                        npm install
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                container('dind') {
                    sh '''
                    set -e
                    docker build -t ${CLIENT_IMAGE}:${IMAGE_TAG} ./client
                    docker build -t ${SERVER_IMAGE}:${IMAGE_TAG} ./server
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
                      -Dsonar.login=${SONAR_PROJECT_TOKEN}
                    """
                }
            }
        }

        stage('Run Docker Images') {
            steps {
                container('dind') {
                    sh '''
                    set -e
                    docker run -d --name client-container ${CLIENT_IMAGE}:${IMAGE_TAG}
                    docker run -d --name server-container ${SERVER_IMAGE}:${IMAGE_TAG}
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check the logs!"
        }
    }
}
