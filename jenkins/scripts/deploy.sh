#!/usr/bin/expect

set user smartadmin
set passwd Smartautotech@123
set host 119.3.3.226
set port 22140
set src_dir ./
set tag_dir /data/server/wuxiadmall
set name dist.zip
set tmp_dir /tmp

##拷贝dist.zip文件到目标机器
spawn sh -c "zip -r dist.zip dist"
expect "$ "
spawn sh -c " scp -P $port -r $src_dir$name $user@$host:$tag_dir"
expect "password:"
send "${passwd}\n"
set timeout 30000
expect "$ "

##登录目标机器
spawn ssh $user@$host -p $port
expect "password:"
send "${passwd}\n"
expect "]$ "
send "cd $tag_dir\n"
expect "]$ "

## 部署
send "sh ./bin/release.sh\n"
expect "]$ "
