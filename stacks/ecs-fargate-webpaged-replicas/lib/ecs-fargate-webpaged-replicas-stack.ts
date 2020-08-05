import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as cdk from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';

export class EcsFargateWebpagedReplicasStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const vpc = new ec2.Vpc(this, 'VPC', {
      subnetConfiguration: [
         {
           cidrMask: 24,
           name: 'ingress',
           subnetType: ec2.SubnetType.PUBLIC,
         },
         {
           cidrMask: 24,
           name: 'application',
           subnetType: ec2.SubnetType.PRIVATE,
         },
         {
           cidrMask: 28,
           name: 'rds',
           subnetType: ec2.SubnetType.ISOLATED,
         }
      ]
   });

   const cluster = new ecs.Cluster(this, 'Cluster', {
    vpc
  });

  const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
    memoryLimitMiB: 512,
    cpu: 256
  });

  const container = fargateTaskDefinition.addContainer("WebContainer", {
    // Use an image from DockerHub
    image: ecs.ContainerImage.fromRegistry("node:12"),
    
  });

  const service = new ecs.FargateService(this, 'Service', {
    cluster,
    taskDefinition: fargateTaskDefinition,
    desiredCount: 2
  });

  const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', 
    { vpc, internetFacing: true });
    
  const listener = lb.addListener('Listener', { port: 80,  open: true  });
  
  listener.addAction('default', {
    priority: 10,
    conditions: [
      elbv2.ListenerCondition.pathPatterns(['/']),
    ],
    action: elbv2.ListenerAction.fixedResponse(200, {
      contentType: elbv2.ContentType.TEXT_PLAIN,
      messageBody: 'OK',
    })
  });

  const targetGroup = listener.addTargets('ECS1', {
    port: 5050,
    targets: [service]
  });

  
  }
}
