FROM ubuntu:focal
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get install git -y 
WORKDIR /home/app
COPY package.json package.json
COPY main.sh main.sh
COPY script.js script.js
RUN chmod +x main.sh
RUN chmod +x script.js
RUN npm install
RUN mkdir output
ENTRYPOINT [ "/home/app/main.sh" ]


# FROM ubuntu:focal
# RUN apt-get update \
#     && apt-get install -y curl git \
#     && curl -sL https://deb.nodesource.com/setup_20.x | bash - \
#     && apt-get install -y nodejs \
#     && apt-get upgrade -y \
#     && rm -rf /var/lib/apt/lists/*
# WORKDIR /home/app
# COPY script.js main.sh package*.json ./
# RUN npm install 
# RUN chmod +x main.sh script.js
# RUN mkdir output
# ENTRYPOINT [ "/home/app/main.sh" ]