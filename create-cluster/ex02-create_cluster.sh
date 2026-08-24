#!/bin/bash
# 1. 퍼블릭 서브넷들에 ALB용 태그 추가 (예시)
aws ec2 create-tags \
  --resources subnet-0e4e94ba6d2c7d7f8 subnet-06c09231e1e87ef4b subnet-0719fd5c2c9232928 \
  --tags Key=kubernetes.io/role/elb,Value=1 Key=kubernetes.io/cluster/std09-eks-cluster,Value=shared

# 2. 프라이빗 서브넷들에 내부 ALB/인프라용 태그 추가 (예시)
aws ec2 create-tags \
  --resources subnet-0a1084b68378a36e1 subnet-0984309a6289f0694 subnet-0499df80696d3e0fb \
  --tags Key=kubernetes.io/role/internal-elb,Value=1 Key=kubernetes.io/cluster/std09-eks-cluster,Value=shared

# 3. EKS 클러스터 생성
# 보안그룹: ssh(sg-015039c4a9fbed56e), alb(sg-0574a3109f4e7be40)
eksctl create cluster \
  --name std09-eks-cluster \
  --region ca-central-1 \
  --version 1.34 \
  --vpc-public-subnets subnet-0e4e94ba6d2c7d7f8 subnet-06c09231e1e87ef4b subnet-0719fd5c2c9232928 \
  --vpc-private-subnets subnet-0a1084b68378a36e1 subnet-0984309a6289f0694 subnet-0499df80696d3e0fb \
  --nodegroup-name std09-managed-ng \
  --node-type t3.small \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --node-volume-size 20 \
  --ssh-access \
  --ssh-public-key std09-keypair \
  --node-security-groups sg-04feb12774209d34b, sg-02e077fd3864024e1 \
  --node-private-networking \
  --managed \
  --with-oidc