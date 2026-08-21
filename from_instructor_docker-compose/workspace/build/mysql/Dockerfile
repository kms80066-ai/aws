FROM mysql:8.4

# 1. 초기화 스크립트 복사
COPY ./init.sql /docker-entrypoint-initdb.d/
RUN chmod 644 /docker-entrypoint-initdb.d/init.sql

# 2. 설정 파일 복사 및 권한 설정
COPY ./my.cnf /etc/mysql/conf.d/my.cnf
RUN chmod 644 /etc/mysql/conf.d/my.cnf

# 3. 환경 변수 (기본값 설정): 실제 의미는 없습니다. run에서 -e로 대체합니다.
# --build-arg로 전달받을 변수 선언
# ARG MYSQL_ROOT_PASSWORD
# 주의: 빌드 시점에 넣은 이 값은 '기본값'입니다. 
# 나중에 k8s 배포(YAML) 시점에 다른 값으로 덮어쓸 수 있습니다.
# ENV MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
# ENV MYSQL_DATABASE=iandb
# ENV MYSQL_USER=ian
# ENV MYSQL_PASSWORD=ian1234!