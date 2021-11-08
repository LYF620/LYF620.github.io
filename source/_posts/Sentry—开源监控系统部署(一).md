---
title: Sentry——开源监控系统部署(一)
date: 2021-03-15 19:17:12
mathjax: true
password:
summary: '错误日志平台'
cover: true
tags:
  - 错误日志平台
  - Sentry
categories: Sentry
img: '/medias/featureimages/4.jpg'
sitemap: true
---

## 什么是 Sentry

Sentry 为一套开源的应用监控和错误追踪的解决方案。这套解决方案由对应各种语言的 SDK 和一套庞大的数据后台服务组成。应用需要通过与之绑定的 token 接入 Sentry SDK 完成数据上报的配置。通过 Sentry SDK 的配置，还可以上报错误关联的版本信息、发布环境。同时 Sentry SDK 会自动捕捉异常发生前的相关操作，便于后续异常追踪。异常数据上报到数据服务之后，会通过过滤、关键信息提取、归纳展示在数据后台的 Web 界面中。

在完成接入后我们就可以从管理系统中实时查看应用的异常，从而主动监控应用在客户端的运行情况。通过配置报警、分析异常发生趋势更主动的将异常扼杀在萌芽状态，影响更少的用户。通过异常详情分析、异常操作追踪，避免对客户端应用异常两眼一抹黑的状态，更高效的解决问题。

## 准备工作

### Docker

Docker 是可以用来构建和容器化应用的开源容器化技术。
Compose 是用于配置和运行多 Docker 应用的工具，可以通过一个配置文件配置应用的所有服务，并一键创建和运行这些服务。
建议部署环境：linux 系统下

#### 部署配置要求：

- Docker 19.03.6+
- Compose 1.24.1+
- 4 CPU Cores
- 8 GB RAM
- 20 GB Free Disk Space

## 快速部署 Sentry

```bash
git clone https://github.com/getsentry/onpremise.git
```

我在这里使用的是最新版本，后续可对比时间，checkout 到对应分支再 clone 代码（Sentry 更新蛮频繁的，如需按照博客流程走，建议使用相对应的版本）

### 后续部署过程中，需要拉取大量镜像，建议配置镜像加速服务（阿里或者 DaoCloud 都有免费的服务），获取到链接后修改或生成/etc/docker/daemon.json 文件即可

```bash
{
  "registry-mirrors": ["镜像地址"]
}
```

在拉取到的代码的根目录下会有 install.sh 文件，可直接执行脚本即可完成快速部署。该脚本会去拉取 Sentry 所需的镜像，过程较慢，建议在网路良好的环境下部署。部署过程大致如下：

- 环境检查
- 生成服务配置
- docker volume 数据卷创建（docker 持久化存储，可理解为 docker 独立的存储）
- 拉取和升级基础镜像
- 构建镜像
- 服务初始化
- 设置管理员账号（跳过此步，可通过手动创建）

执行结束后，会提示创建完毕，在根目录下运行 docker-compose up -d 启动服务，打开 localhost:9000 即可开启 web 页面
在使用不添加 -d 参数运行 docker-compose up 命令后，我们可以看到服务的启动日志，需要等待内部 web、relay、snuba、kafka 等全部启动并联动初始化后，服务才算完全启动

> 第一次访问管理后台，可以看到欢迎页面，完成必填项的配置，即可正式访问管理后台。
> ![Eric 真帅!](/sentry/user.png)

- Root URL：异常上报接口的公网根地址（在做网络解析配置时，后台服务可以配置到内网外网两个域名，只将上报接口的解析规则 /api/[id]/store/ 配置到公网环境，保证数据不会泄密）
- Admin Email：在 install.sh 阶段创建的管理员账号
- Outbound email：这部分内容为邮件服务配置，可以先不配置,后面可以在根目录下的/sentry/config.yml 中配置

## Docker 数据存储位置修改

在服务运行过程中，会有大量的 log、Postgres 生成，这些数据都会挂在到 docker volume 中，volume 默认挂在/var 目录下，通常/var 目录容量较小，随着服务运行内存很容易被占满，我们可以对 docker volume 挂在目录进行修改

```bash
# 在容量最大的目录下创建文件夹
mkdir -p /data/var/lib/
# 停止 docker 服务
systemctl stop docker
# 将 docker 的默认数据复制到新路径下，删除旧数据并创建软连接，即使得存储实际占用磁盘为新路径
/bin/cp -a /var/lib/docker /data/var/lib/docker && rm -rf /var/lib/docker &&  ln -s /data/var/lib/docker /var/lib/docker
# 重启 docker 服务
systemctl start docker
```

## 邮件提醒配置

在根目录下的/sentry/config.yml 进行配置
配置邮箱前，需要先打开邮箱的 smtp 服务，不同邮箱配置方法不同，自行寻找方法配置

```bash
mail.backend: "smtp"
mail.host: "smtp.163.com"
mail.port: 25
mail.username: "邮件地址"
mail.password: "密码"
mail.use-tls: true  #是否使用tls服务
#The email address to send on behalf of
mail.from: "邮件来源地址"
```

该配置文件下还支持配置 git 以及 slack，详情可见[Sentry 官方文档](https://docs.sentry.io/ 'https://docs.sentry.io/')

## .env 文件

```bash
COMPOSE_PROJECT_NAME=sentry_onpremise
SENTRY_EVENT_RETENTION_DAYS=90
SENTRY_IMAGE=getsentry/sentry:83b1380
# You can either use a port number or an IP:PORT combo for SENTRY_BIND
# See https://docs.docker.com/compose/compose-file/#ports for more
SENTRY_BIND=9000
SENTRY_IMAGE=getsentry/sentry:nightly
SNUBA_IMAGE=getsentry/snuba:nightly
RELAY_IMAGE=getsentry/relay:nightly
SYMBOLICATOR_IMAGE=getsentry/symbolicator:nightly
```

环境变量可在根目录下的.env 文件声明，也可在 docker-compose.yml 文件的 environment 声明
SENTRY_EVENT_RETENTION_DAYS 为数据保留时长
对应业务需求，我们可以控制数据保留时长，减少服务器内存消耗
如果数据库没有定时回收的机制，则需要手动进行物理删除。

```bash
# 作为参考的回收语句
vacuumdb -U [用户名] -d [数据库名] -v -f --analyze
```

## Sentry 所需镜像服务以及运行机制

打开根目录下的 docker-compose.yml 文件，同时在终端运行命令

```bash
docker ps -a
```

这里我们可以对比当前运行的容器和 docker-compose 配置，猜测理解每个服务的作用（个人理解，仅限参考）：

- nginx：进行服务间的网络通信
- sentry_defaults：默认环境
  - worker：处理后台工作，邮件，报警等
  - cron：处理定时任务
  - web：sentry 的 web 页面服务
  - post-process-forwarder
  - ingest-consumer：处理 kafka 消息
- snuba-cleanup：数据清理
- relay：
  - web 上报的数据先到 relay
  - relay 直接返回响应状态
  - 然后在后台任务中继续处理数据
  - 解析事件、格式调整、启用过滤规则等
  - 数据写入 kafka
- postgres：服务后台默认的数据库，存储异常数据
- redis：数据拦截配置
- kafka：数据响应，建立服务间的长连接
- zookeeper：支持管理 kafaka 的服务

Sentry 大概运行机制如下：

- 异常数据通过 nginx 解析到 relay 服务。
- relay 通过 pg 获取最新的应用与 token 匹配关系，并验证数据中的 token，直接返回 403 或 200，并对数据进行拦截过滤。
- relay 将数据发送给 kafka 的不同 topic。
- sentry 订阅其中部分 topic，解析数据存入 Postgres，用做后续查看错误详情。
- snuba 订阅其他 topic，对数据打标签，提取关键特征，存入 ClickHouse，用来快速根据关键特征检索数据。

> 下一节介绍 Sentry 介入 SSO 单点登录、角色配置，项目引入以及通用使用方式
