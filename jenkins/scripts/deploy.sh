#!/usr/bin/expect

export user=smartadmin
export passwd=Smartautotech@123
export host=192.168.200.37
export port=22
export src_dir=./
export tag_dir=/data/server/wuximall-admin
export name=dist.zip
export tmp_dir=/tmp

##拷贝dist.zip文件到目标机器
spawn sh -c " scp -P $port -r $src_dir$name $user@$host:$tag_dir"
expect "password:"
send "${passwd}\n"
export timeout=30000
expect "$ "

##登录目标机器
#spawn ssh $user@$host -p $port
#expect "password:"
#send "${passwd}\n"
#expect "]$ "
#send "cd $tag_dir\n"
#expect "]$ "

## 重启
#send "cd ../bin/\n"
#expect "]$ "
#send "./stop.sh\n"
#expect "]$ "
#send "./start.sh\n"
#expect "]$ "
