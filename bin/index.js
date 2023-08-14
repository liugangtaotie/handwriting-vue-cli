#!/usr/bin/env node
const inquirer = require('inquirer')
const { program } = require('commander')
const figlet = require('figlet')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const gitClone = require('git-clone')
const ora = require('ora')

const projectList = {
  vue: 'git@github.com:kfc-vme50/vue-template.git',
  react: 'git@github.com:kfc-vme50/react-template.git',
  'react&ts': 'git@github.com:kfc-vme50/react-template-ts.git',
  'vue&ts': 'git@github.com:kfc-vme50/vue-template-ts.git',
}

// 修改帮助信息的首行展示
program.usage('<command> [options]')
// 版本号
program.version(`v${require('../package.json').version}`)
// 艺术字展示
program.on('--help', function () {
  console.log(
    figlet.textSync('kfc vme50', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 100,
      whitespaceBreak: true,
    })
  )
})

// 创建项目的命令
program
  .command('create <app-name>')
  .description('创建新项目')
  .option('-f, --force', '如果创建的目录存在则强制删除')
  .action(async function (name, option) {
    const cwd = process.cwd()
    const targetPath = path.join(cwd, name)
    // 如果文件夹存在
    if (fs.existsSync(targetPath)) {
      if (option.force) {
        fs.remove(targetPath)
      } else {
        const res = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: '是否覆盖已有文件夹？',
            choices: [
              {
                name: 'YES',
                value: true,
              },
              {
                name: 'NO',
                value: false,
              },
            ],
          },
        ])
        if (!res.action) {
          return
        } else {
          fs.remove(targetPath)
          console.log(chalk.red('已删除之前的文件夹'))
        }
      }
    }

    const res = await inquirer.prompt([
      {
        name: 'type',
        type: 'list',
        message: '请选择使用的框架',
        choices: [
          {
            name: 'Vue',
            value: 'vue',
          },
          {
            name: 'React',
            value: 'react',
          },
        ],
      },
      {
        name: 'ts',
        type: 'list',
        message: '是否使用ts项目',
        choices: [
          {
            name: 'YES',
            value: true,
          },
          {
            name: 'NO',
            value: false,
          },
        ],
      },
    ])
    const rep = res.type + (res.ts ? '&ts' : '')
    // 拉取项目模板
    const spinner = ora('正在加载项目模板...').start()
    gitClone(
      projectList[rep],
      targetPath,
      {
        checkout: 'main',
      },
      (err) => {
        if (!err) {
          fs.remove(path.resolve(targetPath, '.git'))
          spinner.succeed('项目模板加载完成！')
          console.log('now run:')
          console.log(chalk.green(`\n  cd ${name}`))
          console.log(chalk.green('  npm install'))
          console.log(
            chalk.green(`  npm run ${res.type === 'react' ? 'start' : 'dev'}\n`)
          )
        } else {
          spinner.fail(chalk.red('项目模板加载失败，请重新获取！'))
        }
      }
    )
  })

program.parse(process.argv)
