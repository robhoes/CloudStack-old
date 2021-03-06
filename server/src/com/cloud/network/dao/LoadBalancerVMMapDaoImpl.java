/**
 *  Copyright (C) 2010 Cloud.com, Inc.  All rights reserved.
 * 
 * This software is licensed under the GNU General Public License v3 or later.
 * 
 * It is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

package com.cloud.network.dao;

import java.util.List;

import javax.ejb.Local;

import com.cloud.network.LoadBalancerVMMapVO;
import com.cloud.utils.db.GenericDaoBase;
import com.cloud.utils.db.SearchCriteria;

@Local(value={LoadBalancerVMMapDao.class})
public class LoadBalancerVMMapDaoImpl extends GenericDaoBase<LoadBalancerVMMapVO, Long> implements LoadBalancerVMMapDao {

    @Override
    public void remove(long loadBalancerId) {
        SearchCriteria<LoadBalancerVMMapVO> sc = createSearchCriteria();
        sc.addAnd("loadBalancerId", SearchCriteria.Op.EQ, loadBalancerId);

        expunge(sc);
    }

    @Override
    public void remove(long loadBalancerId, List<Long> instanceIds, Boolean revoke) {
        SearchCriteria<LoadBalancerVMMapVO> sc = createSearchCriteria();
        sc.addAnd("loadBalancerId", SearchCriteria.Op.EQ, loadBalancerId);
        sc.addAnd("instanceId", SearchCriteria.Op.IN, instanceIds.toArray());
        if (revoke != null) {
            sc.addAnd("revoke", SearchCriteria.Op.EQ, revoke);
        }

        expunge(sc);
    }

    @Override
    public List<LoadBalancerVMMapVO> listByInstanceId(long instanceId) {
        SearchCriteria<LoadBalancerVMMapVO> sc = createSearchCriteria();
        sc.addAnd("instanceId", SearchCriteria.Op.EQ, instanceId);

        return listBy(sc);
    }

    @Override
    public List<LoadBalancerVMMapVO> listByLoadBalancerId(long loadBalancerId) {
        SearchCriteria<LoadBalancerVMMapVO> sc = createSearchCriteria();
        sc.addAnd("loadBalancerId", SearchCriteria.Op.EQ, loadBalancerId);

        return listBy(sc);
    }

    @Override
    public List<LoadBalancerVMMapVO> listByLoadBalancerId(long loadBalancerId, boolean pending) {
        SearchCriteria<LoadBalancerVMMapVO> sc = createSearchCriteria();
        sc.addAnd("loadBalancerId", SearchCriteria.Op.EQ, loadBalancerId);
        sc.addAnd("revoke", SearchCriteria.Op.EQ, pending);

        return listBy(sc);
    }
    
    @Override
    public LoadBalancerVMMapVO findByLoadBalancerIdAndVmId(long loadBalancerId, long instanceId) {
        SearchCriteria<LoadBalancerVMMapVO> sc = createSearchCriteria();
        sc.addAnd("loadBalancerId", SearchCriteria.Op.EQ, loadBalancerId);
        sc.addAnd("instanceId", SearchCriteria.Op.EQ, instanceId);
        return findOneBy(sc);
    }

    
}
