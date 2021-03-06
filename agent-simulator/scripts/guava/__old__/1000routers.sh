# Copyright (C) 2011 Citrix Systems, Inc.  All rights reserved
#     
# This software is licensed under the GNU General Public License v3 or later.
# 
# It is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or any later version.
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
# 




zoneid=$1
templateId=$2
serviceOfferingId=$3

for j in `seq 1 100`
do
	let add=0
	for i in `seq 1 10`
	do
		let account=$(($i+$add))
		echo Account Name: , $account
		query="GET	http://127.0.0.1/client/?command=deployVirtualMachine&zoneId=$1&hypervisor=Simulator&templateId=$2&serviceOfferingId=$3&account=DummyAccount$account&domainid=1	HTTP/1.0\n\n"
	  echo -e $query | nc -v -q 20 127.0.0.1 8096
	done
	let add=add+10
	sleep 60s
done
