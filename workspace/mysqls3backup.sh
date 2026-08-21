#!/bin/bash

# 사용자 설정 변수 (질문자님 환경 적용)
DB_HOST="10.0.152.75"
DB_USER="std09"
DB_PASS="qwe123"
DB_NAME="testdb"
BACKUP_DIR="/tmp"
BUCKET_NAME="std09-s3"
BUCKET_DIR="backup"

# 날짜 포맷 정의 (예: 2026-08-06_1300)
DATE=$(date +%Y-%m-%d_%H%M)

# 백업 파일명 정의
FILE_NAME="backup-${DB_NAME}-${DATE}.sql.gz"

# 1. MySQL 백업 진행 (-h 옵션 포함, 압축하여 용량 절약)
mysqldump -h ${DB_HOST} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} | gzip > ${BACKUP_DIR}/${FILE_NAME}

# 2. AWS S3 버킷으로 업로드
aws s3 cp ${BACKUP_DIR}/${FILE_NAME} s3://${BUCKET_NAME}/${BUCKET_DIR}/${FILE_NAME}

# 3. 서버 내부 공간 확보를 위해 로컬에 생성된 임시 백업 파일 삭제
rm -f ${BACKUP_DIR}/${FILE_NAME}