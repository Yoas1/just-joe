FROM python:3.11

WORKDIR /app

COPY app.py /app/app.py
COPY run.sh /app/run.sh
COPY static /app/static
COPY templates /app/templates
COPY requirements.txt /app/requirements.txt

ENV TZ=Asia/Jerusalem
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && \
    apt-get install -yq tzdata && \
    ln -fs /usr/share/zoneinfo/Asia/Jerusalem /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    chmod +x /app/run.sh



ENTRYPOINT ["/app/run.sh"]