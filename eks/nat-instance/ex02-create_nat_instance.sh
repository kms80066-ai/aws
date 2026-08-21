#!/bin/bash
DEFAULT_NAME="std09-"
INSTANCE_NAME="${DEFAULT_NAME}nat-instance"
AMI_ID="ami-02cb4c5977b6a5f87"
INSTANCE_TYPE="t3.micro"
KEY_NAME="std09-keypair"
SUBNET_ID="subnet-0e5b3325bac50ac73"
SECURITY_GROUP_IDS="sg-06cdc319a6b8e2aba sg-015039c4a9fbed56e"

# 퍼블릭 IP 구성하려면 true, 아니면 false
PUBLIC_IP=true
# NAT 인스턴스로 사용할 경우 소스/대상 확인을 비활성화(false)해야 함, 아래 true로 놓으면 비활성화 됨
DISABLE_SOURCE_DEST_CHECK=true

# 1. 퍼블릭 IP 할당 여부에 따른 인스턴스 생성
if [[ "$PUBLIC_IP" == "true" ]]; then
  INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --count 1 \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --subnet-id "$SUBNET_ID" \
    --security-group-ids $SECURITY_GROUP_IDS \
    --associate-public-ip-address \
    --user-data file://nat-user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
    --query "Instances[0].InstanceId" --output text)
else
  INSTANCE_ID=$(aws ec2 run-instances \
    --image-id "$AMI_ID" \
    --count 1 \
    --instance-type "$INSTANCE_TYPE" \
    --key-name "$KEY_NAME" \
    --subnet-id "$SUBNET_ID" \
    --security-group-ids $SECURITY_GROUP_IDS \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
    --query "Instances[0].InstanceId" --output text)
fi

echo "Created Instance ID: $INSTANCE_ID"

# 2. 인스턴스가 완전히 생성될 때까지 대기
echo "Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

# 3. NAT 인스턴스인 경우 소스/대상 확인 비활성화 적용
if [[ "$DISABLE_SOURCE_DEST_CHECK" == "true" ]]; then
  aws ec2 modify-instance-attribute \
    --instance-id "$INSTANCE_ID" \
    --source-dest-check '{"Value": false}'
  echo "Source/Destination Check disabled successfully for $INSTANCE_ID"
fi

echo "All tasks completed successfully!"