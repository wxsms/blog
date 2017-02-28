<template>
  <section>
    <page-header title="个人简历"></page-header>
    <div class="container-fluid" ref="container">
      <div class="row">
        <div class="col-xs-12">
          <div>
            <p>郭凯瑞，男，前端 / JavaScript 开发工程师。</p>
            <p>电话：
              <abbr>13360231633</abbr>
            </p>
            <p>邮箱：
              <a href="mailto:edisond@qq.com">edisond@qq.com</a>
            </p>
            <p>博客：
              <a href="https://wxsm.space" target="_blank">https://wxsm.space</a>
            </p>
            <p>Github：
              <a href="https://github.com/wxsms" target="_blank">https://github.com/wxsms</a>
            </p>
          </div>
          <div>
            <h4 class="page-header">教育经历</h4>
            <p>2011 - 2015 年就读于广州暨南大学珠海校区（211），软件工程专业。</p>
            <p>2015 年 6 月毕业，本科学历，学士学位。</p>
            <p>所获证书（部分）：</p>
            <ul>
              <li>大学英语四级</li>
              <li>大学英语六级</li>
              <li>ACM ICPC 2012 广东（三等奖）</li>
            </ul>
          </div>
          <div>
            <h4 class="page-header">工作经历</h4>
            <p>
              <b>东方海外（中国）信息研发中心</b>
            </p>
            <p>2014 年 11 月进入珠海东方海外（下称 OOCL）UCD 团队实习，次年 5 月实习期满，离职。</p>
            <p>担任岗位：Intern（实习生）</p>
            <p>在公司 UCD 团队负责设计的技术实现。通过使用 ExtJS / jQuery / Bootstrap / AngularJS 等技术开发健壮可复用的页面组件与前后分离的完整页面。开发兼容 IE 6 / 7 /
              8
              等老式浏览器的页面，或寻求替代方案。</p>
            <p>
              <b>2015 年 7 月正式进入 OOCL CargoSmart 团队工作至今</b>
            </p>
            <p>担任岗位：ATE（助理工程师）</p>
            <p>参与开发、维护公司核心业务平台系统 cargosmart.com 以及新产品（如 bigschedules.com），以及各种公司内部工具。涉及的技术栈有 Java (EE) / OC4J / Ant /
              OracleDB / Weblogic / Maven，NodeJS / Express / NPM / MongoDB 等。了解自动测试、持续集成以及产品部署相关技术。</p>
            <p>前端方面，常用技术有 Angular / Vue / jQuery 等，辅以 Grunt / Gulp / Webpack 等自动化工具进行开发。在公司团队中大力推广 ES6 的使用。</p>
          </div>
          <div>
            <h4 class="page-header">项目经历</h4>
            <p>以下为部分项目经历。</p>
            <p>
              <b>My CargoSmart Center (CS2)</b>
              <a href="http://cargosmart.com" target="_blank">
                <i class="glyphicon glyphicon-link"></i>
              </a>
            </p>
            <p>公司核心业务平台，大型集成系统。系统集成了世界范围内的多家船公司，基本包含船运业所有业务模块，为客户提供一站式服务。</p>
            <p>系统技术栈为 jQuery / JSF / Java 1.5 / Ant / OC4J / OracleDB，使用 JMS (Tibco EMS + Tibco WORKER) 进行集成，使用 Jenkins
              实现持续集成、部署。</p>
            <p>在任期间，主要担任系统维护角色。主要负责了 Shipment Plan （船运计划）以及 Shipping Instruction（装船指示）模块项目的开发及维护。同时，参与了 2016 年新业务项目 SOLAS
              VGM （海上人命公约称重须求）的开发。</p>
            <p>
              <b>BigSchedules.com</b>
              <a href="http://bigschedules.com" target="_blank">
                <i class="glyphicon glyphicon-link"></i>
              </a>
            </p>
            <p>公司 2015 年上线的世界船期搜索 / 监控产品，同时也是公司首个使用 MEAN 技术栈且为单页应用的主打对外产品。使用 Grunt / Gulp 方式打包部署。</p>

            <p>个人参与此项目分为两个阶段：</p>
            <ul>
              <li>第一阶段为实习期，参与了大部分项目原型页面以及一些重点自定义控件的开发，属于纯前端工作</li>
              <li>第二阶段为正式工作期，加入了 BigSchedules 团队，并且开始开发维护整个系统。由于个人能力关系，经常参与的是一些较为新颖的前端任务。</li>
            </ul>
          </div>
          <div>
            <h4 class="page-header">个人其他</h4>
            <p>使用语言：普通话（精通 & 标准）、粤语（精通 & 标准）、英语（熟练）</p>
            <p>兴趣爱好：编程、读书、游戏</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  import PageHeader from './../architecture/PageHeader.vue'

  export default {
    components: { PageHeader }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>

</style>
