package com.cloud.hypervisor.dao;

import java.util.List;

import javax.ejb.Local;

import org.apache.log4j.Logger;

import com.cloud.hypervisor.Hypervisor.HypervisorType;
import com.cloud.hypervisor.HypervisorCapabilitiesVO;
import com.cloud.utils.db.GenericDaoBase;
import com.cloud.utils.db.GenericSearchBuilder;
import com.cloud.utils.db.SearchBuilder;
import com.cloud.utils.db.SearchCriteria;

@Local(value=HypervisorCapabilitiesDao.class)
public class HypervisorCapabilitiesDaoImpl extends GenericDaoBase<HypervisorCapabilitiesVO, Long> implements HypervisorCapabilitiesDao {
    
    private static final Logger s_logger = Logger.getLogger(HypervisorCapabilitiesDaoImpl.class);

    protected final SearchBuilder<HypervisorCapabilitiesVO> HypervisorTypeSearch;
    protected final SearchBuilder<HypervisorCapabilitiesVO> HypervisorTypeAndVersionSearch;
    protected final GenericSearchBuilder<HypervisorCapabilitiesVO, Long> MaxGuestLimitByHypervisorSearch;
    
    //we insert a record for each hypervisor type with version 'default' to ensure we dont face errors in case hypervisor version is missing or does not match.
    private static final String DEFAULT_VERSION = "default";
    
    protected HypervisorCapabilitiesDaoImpl() {
        HypervisorTypeSearch = createSearchBuilder();
        HypervisorTypeSearch.and("hypervisorType", HypervisorTypeSearch.entity().getHypervisorType(), SearchCriteria.Op.EQ);
        HypervisorTypeSearch.done();
        
        HypervisorTypeAndVersionSearch = createSearchBuilder();
        HypervisorTypeAndVersionSearch.and("hypervisorType", HypervisorTypeAndVersionSearch.entity().getHypervisorType(), SearchCriteria.Op.EQ);
        HypervisorTypeAndVersionSearch.and("hypervisorVersion", HypervisorTypeAndVersionSearch.entity().getHypervisorVersion(), SearchCriteria.Op.EQ);
        HypervisorTypeAndVersionSearch.done();
        
        MaxGuestLimitByHypervisorSearch = createSearchBuilder(Long.class);
        MaxGuestLimitByHypervisorSearch.selectField(MaxGuestLimitByHypervisorSearch.entity().getMaxGuestsLimit());
        MaxGuestLimitByHypervisorSearch.and("hypervisorType", MaxGuestLimitByHypervisorSearch.entity().getHypervisorType(), SearchCriteria.Op.EQ);
        MaxGuestLimitByHypervisorSearch.and("hypervisorVersion", MaxGuestLimitByHypervisorSearch.entity().getHypervisorVersion(), SearchCriteria.Op.EQ);
        MaxGuestLimitByHypervisorSearch.done();        
    }

    @Override
    public List<HypervisorCapabilitiesVO> listAllByHypervisorType(HypervisorType hypervisorType){
        SearchCriteria<HypervisorCapabilitiesVO> sc = HypervisorTypeSearch.create();
        sc.setParameters("hypervisorType", hypervisorType);
        return search(sc, null);
    }
    
    @Override
    public HypervisorCapabilitiesVO findByHypervisorTypeAndVersion(HypervisorType hypervisorType, String hypervisorVersion){
        SearchCriteria<HypervisorCapabilitiesVO> sc = HypervisorTypeAndVersionSearch.create();
        sc.setParameters("hypervisorType", hypervisorType);
        sc.setParameters("hypervisorVersion", hypervisorVersion);
        return findOneBy(sc);
    }
    
    @Override
    public Long getMaxGuestsLimit(HypervisorType hypervisorType, String hypervisorVersion){
        Long defaultLimit = new Long(50);
        Long result = null;
        boolean useDefault = false;
        if(hypervisorVersion != null){
            SearchCriteria<Long> sc = MaxGuestLimitByHypervisorSearch.create();
            sc.setParameters("hypervisorType", hypervisorType);
            sc.setParameters("hypervisorVersion", hypervisorVersion);
            List<Long> limitList = customSearch(sc, null);
            if(!limitList.isEmpty()){
                result = limitList.get(0);
            }else{
                useDefault = true;
            }
        }else{
            useDefault = true;
        }
        if(useDefault){
            SearchCriteria<Long> sc = MaxGuestLimitByHypervisorSearch.create();
            sc.setParameters("hypervisorType", hypervisorType);
            sc.setParameters("hypervisorVersion", DEFAULT_VERSION);
            List<Long> limitList = customSearch(sc, null);
            if(!limitList.isEmpty()){
                result = limitList.get(0);
            }
        }
        if(result == null){
            return defaultLimit;
        }
        return result;
    }
}