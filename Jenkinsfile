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
        DOCKER_IMAGE  = "2401041-taskmanager-frontend:latest"
        // DOCKER_HOST removed -> use default unix:///var/run/docker.sock inside dind
        SONAR_TOKEN   = "sqp_e9cbc6586722262385ddb640679a266b8221d52f"
        REGISTRY_HOST = "image: nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401041/2401041-taskmanager-frontend:latest"
        REGISTRY      = "${REGISTRY_HOST}/2401041"
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
                    sh 'docker login $REGISTRY_HOST -u admin -p Changeme@2025'
                }
            }
        }

        stage('Build - Tag - Push') {
            steps {
                container('dind') {
                    sh '''
                        docker tag taskmanager-webapp:latest $REGISTRY_URL/$REGISTRY_PROJECT/taskmanager-webapp:latest
                        docker push $REGISTRY_URL/$REGISTRY_PROJECT/taskmanager-webapp:latest
                        docker pull $REGISTRY_URL/$REGISTRY_PROJECT/taskmanager-webapp:latest
                        docker image ls
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
