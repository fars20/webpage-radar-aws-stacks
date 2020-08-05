#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { EcsFargateWebpagedReplicasStack } from '../lib/ecs-fargate-webpaged-replicas-stack';

const app = new cdk.App();
new EcsFargateWebpagedReplicasStack(app, 'EcsFargateWebpagedReplicasStack');
