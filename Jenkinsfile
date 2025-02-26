def remote = [:]
def git_url = "git@github.com:Bella0708/actions-test.git"

pipeline {
    agent any
    parameters {
        gitParameter(name: 'branch', type: 'PT_BRANCH', sortMode: 'DESCENDING_SMART', selectedValue: 'NONE', quickFilterEnabled: true)
    }
    environment {
        REPO = "zabella/go_workers"
        DOCKER_IMAGE = 'node'
        DOCKER_TAG = 'apline'
        HOST = "44.203.170.192"
        TOKEN = credentials('tokentell')
        CHAT_ID = "683028341"
        LINK = "<a href=\"${BUILD_URL}\">${JOB_NAME} #${BUILD_NUMBER}</a>"
    }
    stages {
        stage('Configure credentials') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'jenkins_ssh_key', keyFileVariable: 'private_key', usernameVariable: 'username')]) {
                    script {
                        remote.name = "${env.HOST}"
                        remote.host = "${env.HOST}"
                        remote.user = "$username"
                        remote.identity = readFile("$private_key")
                        remote.allowAnyHosts = true
                    }
                }
            }
        }

        stage('Clone Repository') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: "${branch}"]], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'jenkins_ssh_key', url: "$git_url"]]])
            }
        }

        stage('Build and Push Docker Image') {
    steps {
        script {
            def image = docker.build("${env.REPO}:${env.BUILD_ID}")
            docker.withRegistry('https://registry-1.docker.io', 'hub_token') {
                image.push()
            }
        }
    }
}

    stage('Deploy application') {
    steps {
        withCredentials([usernamePassword(credentialsId: 'hub_token', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            script {
                sshCommand remote: remote, command: """
                    set -ex ; set -o pipefail
                    if ! command -v docker-compose &> /dev/null; then
                        echo 'docker-compose не найден, устанавливаю...'
                        sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
                        sudo chmod +x /usr/local/bin/docker-compose
                    fi
                    docker-compose up -d
                    echo ${PASSWORD} | docker login -u ${USERNAME} --password-stdin
                    docker pull "${env.REPO}:${env.BUILD_ID}"
                    docker rm ${env.SVC} --force 2> /dev/null || true
                    docker run -d -it -p ${env.PORT}:${env.PORT} --name ${env.SVC} "${env.REPO}:${env.BUILD_ID}"
                """
            }
        }
    }
}

stage('Test Application') {
    steps {
        sh 'docker exec -i $(docker ps -q -f "ancestor=${env.REPO}:${env.BUILD_ID}") npx mocha test/app.test.js'
    }
}

    post {
        success {
            script {
                sh "curl -X POST -H 'Content-Type: application/json' -d '{\"chat_id\": \"${CHAT_ID}\", \"text\": \"${LINK}\n🟢 Deploy succeeded! \", \"parse_mode\": \"HTML\", \"disable_notification\": false}' \"https://api.telegram.org/bot${TOKEN}/sendMessage\""
            }
        }
        failure {
            script {
                sh "curl -X POST -H 'Content-Type: application/json' -d '{\"chat_id\": \"${CHAT_ID}\", \"text\": \"${LINK}\n🔴 Deploy failure! \", \"parse_mode\": \"HTML\", \"disable_notification\": false}' \"https://api.telegram.org/bot${TOKEN}/sendMessage\""
            }
        }
        aborted {
            script {
                sh "curl -X POST -H 'Content-Type: application/json' -d '{\"chat_id\": \"${CHAT_ID}\", \"text\": \"${LINK}\n⚪️ Deploy aborted! \", \"parse_mode\": \"HTML\", \"disable_notification\": false}' \"https://api.telegram.org/bot${TOKEN}/sendMessage\""
            }
        }
    }
}
