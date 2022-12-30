# FROM python:3.8

# VOLUME /app
# WORKDIR /app
# COPY . /app
# RUN pip3 install -r requirements.txt

# CMD ["python3", "app.py"]
FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

CMD ["python3", "app.py"]