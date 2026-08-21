#!/bin/bash
# DEFAULT_TAG="ian-"
# VPC_ID="vpc-0a6f55c4eab68986d"
DEFAULT_TAG="std09-ex-"
VPC_ID="vpc-0e599640b22e89a0f"
# 0. NAT Instance 보안 그룹 ==============================================================
NAT_SG_NAME="${DEFAULT_TAG}nat-sg"
NAT_SG_ID=$(aws ec2 create-security-group \
  --group-name $NAT_SG_NAME \
  --description "Security group for NAT Instance" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${NAT_SG_NAME}}]" \
  --query 'GroupId' --output text)

# 모든 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $NAT_SG_ID \
  --protocol -1 \
  --cidr 10.0.0.0/16

# 1. ALB 보안 그룹 생성 ===================================================================
# 1.1 EXTERNAL ALB 보안 그룹 생성 
EXTERNAL_ALB_SG_NAME="${DEFAULT_TAG}external-alb-sg"
INTERNAL_ALB_SG_NAME="${DEFAULT_TAG}internal-alb-sg"

EXTERNAL_ALB_SG_ID=$(aws ec2 create-security-group \
  --group-name $EXTERNAL_ALB_SG_NAME \
  --description "Security group for External ALB" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${EXTERNAL_ALB_SG_NAME}}]" \
  --query 'GroupId' --output text)

# 80번(HTTP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $EXTERNAL_ALB_SG_ID \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

# 443번(HTTPS) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $EXTERNAL_ALB_SG_ID \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# 1.2 INTERNAL ALB & Web Service Security Group ----------------------------------------------
INTERNAL_ALB_SG_ID=$(aws ec2 create-security-group \
  --group-name $INTERNAL_ALB_SG_NAME \
  --description "Security group for External ALB" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${INTERNAL_ALB_SG_NAME}}]" \
  --query 'GroupId' --output text)

# 80번(HTTP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $INTERNAL_ALB_SG_ID \
  --protocol tcp --port 80 \
  --source-group $EXTERNAL_ALB_SG_ID

# 443번(HTTPS) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $INTERNAL_ALB_SG_ID \
  --protocol tcp --port 443 \
  --source-group $EXTERNAL_ALB_SG_ID

# 2. SSH 보안 그룹 생성 ===================================================================
# 2.1 EXTERNAL SSH 보안 그룹 생성 
EXTERNAL_SSH_SG_NAME="${DEFAULT_TAG}external-ssh-sg"
INTERNAL_SSH_SG_NAME="${DEFAULT_TAG}internal-ssh-sg"

EXTERNAL_SSH_SG_ID=$(aws ec2 create-security-group \
  --group-name $EXTERNAL_SSH_SG_NAME \
  --description "Security group for External SSH" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${EXTERNAL_SSH_SG_NAME}}]" \
  --query 'GroupId' --output text)

# 22번(TCP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $EXTERNAL_SSH_SG_ID \
  --protocol tcp --port 22 --cidr 0.0.0.0/0

# 1.2 INTERNAL SSH & OpenSSH Service Security Group ----------------------------------------------
INTERNAL_SSH_SG_ID=$(aws ec2 create-security-group \
  --group-name $INTERNAL_SSH_SG_NAME \
  --description "Security group for External SSH" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${INTERNAL_SSH_SG_NAME}}]" \
  --query 'GroupId' --output text)

# 22번(TCP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $INTERNAL_SSH_SG_ID \
  --protocol tcp --port 22 \
  --source-group $EXTERNAL_SSH_SG_ID


# 3. MySQL 보안 그룹 생성 ===================================================================
EXTERNAL_MYSQL_SG_NAME="${DEFAULT_TAG}external-mysql-sg"
INTERNAL_MYSQL_SG_NAME="${DEFAULT_TAG}internal-mysql-sg"
# 3.1 EXTERNAL MySQL 보안 그룹 생성 
INTERNAL_MYSQL_SG_ID=$(aws ec2 create-security-group \
  --group-name $INTERNAL_MYSQL_SG_NAME \
  --description "Security group for Internal MYSQL" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${INTERNAL_MYSQL_SG_NAME}}]" \
  --query 'GroupId' --output text)

# 3306번(TCP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $INTERNAL_MYSQL_SG_ID \
  --protocol tcp --port 3306 --cidr 10.0.0.0/16

# 33060번(TCP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $INTERNAL_MYSQL_SG_ID \
  --protocol tcp --port 33060 --cidr 10.0.0.0/16

# 33061번(TCP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $INTERNAL_MYSQL_SG_ID \
  --protocol tcp --port 33061 --cidr 10.0.0.0/16

# 33062번(TCP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $INTERNAL_MYSQL_SG_ID \
  --protocol tcp --port 33062 --cidr 10.0.0.0/16

# 1.2 INTERNAL SSH & OpenSSH Service Security Group ----------------------------------------------
EXTERNAL_MYSQL_SG_ID=$(aws ec2 create-security-group \
  --group-name $EXTERNAL_MYSQL_SG_NAME \
  --description "Security group for External MySQL" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${EXTERNAL_MYSQL_SG_NAME}}]" \
  --query 'GroupId' --output text)

# 22번(TCP) 포트 전체 개방
aws ec2 authorize-security-group-ingress \
  --group-id $EXTERNAL_MYSQL_SG_ID \
  --protocol tcp --port 3306 \
  --source-group $EXTERNAL_SSH_SG_ID

echo "============================================================"
echo "VPC ID: $VPC_ID"
echo "NAT Security Group ID: $NAT_SG_ID"
echo "ALB Security Group ID: $EXTERNAL_ALB_SG_ID"
echo "Internal ALB Security Group ID: $INTERNAL_ALB_SG_ID"
echo "SSH Security Group ID: $EXTERNAL_SSH_SG_ID"
echo "Internal SSH Security Group ID: $INTERNAL_SSH_SG_ID"
echo "Internal MySQL Security Group ID: $INTERNAL_MYSQL_SG_ID"
echo "External MySQL Security Group ID: $EXTERNAL_MYSQL_SG_ID"