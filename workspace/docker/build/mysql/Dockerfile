FROM mysql:8.0

# 컨테이너의 /docker-entrypoint-initdb.d 디렉토리에 있는 모든 .sql파일을 실행하여
# 데이터베이스를 초기화할 때 사용합니다.
COPY ./init.sql /docker-entrypoint-initdb.d/
COPY ./my.cnf /etc/mysql/conf.d/my.cnf

ENV MYSQL_ROOT_PASSWORD=qwe123
ENV MYSQL_DATABASE=testdb
ENV MYSQL_USER=std09
ENV MYSQL_PASSWORD=qwe123
# root의 비밀번호를 랜덤한 난수로 지정
# ENV MYSQL_RANDOM_ROOT_PASSWORD=yes
# CMD는 사용하지 않습니다. 기본 이미지에 이미 포함되어 있어 사용하지 않아도 됩니다.
