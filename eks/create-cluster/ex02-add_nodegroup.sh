#!/bin/bash
# ex02-create_cluster.sh를 통해 생성된 eks cluster의 ian-managed-ng 노드 그룹의 스케일을 수정하고
eksctl scale nodegroup \
  --cluster std09-eks-cluster \
  --region ca-central-1 \
  --name std09-managed-ng \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 6

# 추가로 새로운 노드 그룹 추가
eksctl create nodegroup \
  --cluster std09-eks-cluster \
  --region ca-central-1 \
  --name std09-managed-ng-2 \
  --node-type t3.small \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --node-volume-size 20 \
  --ssh-access \
  --ssh-public-key std09-keypair \
  --managed