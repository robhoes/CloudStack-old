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

// Version: @VERSION@

var DomRTemplateId = 1;

function showTemplatesTab() {
	// Manage Templates 
    // *** Template (begin) ***	
	activateDialog($("#dialog_edit_template").dialog({ 
		width:450,
		autoOpen: false,
		modal: true,
		zIndex: 2000
	}));
	
	activateDialog($("#dialog_add_template").dialog({ 
		width:450,
		autoOpen: false,
		modal: true,
		zIndex: 2000
	}));
	
	activateDialog($("#dialog_copy_template").dialog({ 
		width:300,
		autoOpen: false,
		modal: true,
		zIndex: 2000
	}));
	
	activateDialog($("#dialog_create_vm_from_template").dialog({ 
		width:300,
		autoOpen: false,
		modal: true,
		zIndex: 2000
	}));
	
	
	var g_zoneIds = [], g_zoneNames = [];				
	var addTemplateZoneField = $("#dialog_add_template #add_template_zone");	
    var addIsoZoneField = $("#dialog_add_iso #add_iso_zone");	        
	// Add default zone
	if (isAdmin()) {
		addTemplateZoneField.append("<option value='-1'>All Zones</option>"); 
		addIsoZoneField.append("<option value='-1'>All Zones</option>"); 
	}
    $.ajax({
            data: createURL("command=listZones&available=true&response=json"+maxPageSize),
	    dataType: "json",
	    success: function(json) {		        
		    var zones = json.listzonesresponse.zone;	 			     			    	
		    if (zones != null && zones.length > 0) {
		        for (var i = 0; i < zones.length; i++) {
			        addTemplateZoneField.append("<option value='" + zones[i].id + "'>" + sanitizeXSS(zones[i].name) + "</option>"); 
			        addIsoZoneField.append("<option value='" + zones[i].id + "'>" + sanitizeXSS(zones[i].name) + "</option>"); 	
			        g_zoneIds.push(zones[i].id);
			        g_zoneNames.push(zones[i].name);			       
		        }
		    }				    			
	    }
	});		
	
	function populateZoneField(zoneField, excludeZoneId) {	    
	    zoneField.empty();  
	    if (g_zoneIds != null && g_zoneIds.length > 0) {
	        for (var i = 0; i < g_zoneIds.length; i++) {
	            if(g_zoneIds[i]	!= excludeZoneId)			            
		            zoneField.append("<option value='" + g_zoneIds[i] + "'>" + sanitizeXSS(g_zoneNames[i]) + "</option>"); 			        			       
	        }
	    }			    
	}
	
	$.ajax({
	        data: createURL("command=listOsTypes&response=json"),
		dataType: "json",
		success: function(json) {
			types = json.listostypesresponse.ostype;
			if (types != null && types.length > 0) {
				var templateSelect = $("#dialog_add_template #add_template_os_type, #dialog_edit_template #edit_template_os_type").empty();
				var isoSelect = $("#dialog_add_iso #add_iso_os_type").empty();
				for (var i = 0; i < types.length; i++) {
					var html = "<option value='" + types[i].id + "'>" + types[i].description + "</option>";
					templateSelect.append(html);
					isoSelect.append(html);
				}
			}	
		}
	});
	
	$.ajax({
	    data: createURL("command=listServiceOfferings&response=json"),
	    dataType: "json",
	    success: function(json) {
	        var items = json.listserviceofferingsresponse.serviceoffering;
	        if(items != null && items.length > 0 ) {
	            var serviceOfferingField = $("#dialog_create_vm_from_template #service_offering").empty();
	            for(var i = 0; i < items.length; i++)		        
	                serviceOfferingField.append("<option value='" + items[i].id + "'>" + sanitizeXSS(items[i].name) + "</option>");
	        }		        
	    }
	});		
	
	$.ajax({
	    data: createURL("command=listDiskOfferings&response=json"),
	    dataType: "json",
	    success: function(json) {
	        var items = json.listdiskofferingsresponse.diskoffering;
	        if(items != null && items.length > 0 ) {
	            var diskOfferingField = $("#dialog_create_vm_from_template #disk_offering").empty();
	            for(var i = 0; i < items.length; i++)		        
	                diskOfferingField.append("<option value='" + items[i].id + "'>" + sanitizeXSS(items[i].name) + "</option>");
	        }		  
	        
	    }
	});		
	
	$("#template_action_new").show();
	var formatSelect = $("#add_template_format").empty();
	if (getHypervisorType() == "kvm") {
		formatSelect.append("<option value='QCOW2'>QCOW2</option>");
		formatSelect.append("<option value='VHD'>VHD</option>");
		formatSelect.append("<option value='VMDK'>VMDK</option>");
	} else if (getHypervisorType() == "xenserver") {
		formatSelect.append("<option value='VHD'>VHD</option>");
		formatSelect.append("<option value='QCOW2'>QCOW2</option>");
		formatSelect.append("<option value='VMDK'>VMDK</option>");
	}
			
	$("#template_action_new").bind("click", function(event) {		 
		$("#dialog_add_template")
		.dialog('option', 'buttons', { 				
			"Create": function() { 		
			    var thisDialog = $(this);
						
				// validate values
				var isValid = true;					
				isValid &= validateString("Name", thisDialog.find("#add_template_name"), thisDialog.find("#add_template_name_errormsg"));
				isValid &= validateString("Display Text", thisDialog.find("#add_template_display_text"), thisDialog.find("#add_template_display_text_errormsg"));
				isValid &= validateString("URL", thisDialog.find("#add_template_url"), thisDialog.find("#add_template_url_errormsg"));			
				if (!isValid) return;		
										
				var name = trim(thisDialog.find("#add_template_name").val());
				var desc = trim(thisDialog.find("#add_template_display_text").val());
				var url = trim(thisDialog.find("#add_template_url").val());						
				var zoneId = thisDialog.find("#add_template_zone").val();												
				var format = thisDialog.find("#add_template_format").val();					
				var password = thisDialog.find("#add_template_password").val();		
				var isPublic = thisDialog.find("#add_template_public").val();	                    	
				var osType = thisDialog.find("#add_template_os_type").val();
				var hypervisor = thisDialog.find("#add_template_hypervisor").val();
				
				var moreCriteria = [];				
				if(thisDialog.find("#add_template_featured_container").css("display")!="none") {				
				    var isFeatured = thisDialog.find("#add_template_featured").val();						    	
                    moreCriteria.push("&isfeatured="+isFeatured);
                }					
				
				thisDialog.dialog("close");
				
				var submenuContent = $("#submenu_content_template");						
			    var template = $("#vm_template_template").clone(true);					   
			    var loadingImg = template.find(".adding_loading");		
                var rowContainer = template.find("#row_container");    	                               
                loadingImg.find(".adding_text").text("Adding....");	
                loadingImg.show();  
                rowContainer.hide();                   
			    submenuContent.find("#grid_content").prepend(template.fadeIn("slow"));	 				
												
				$.ajax({
				        data: createURL("command=registerTemplate&name="+encodeURIComponent(name)+"&displayText="+encodeURIComponent(desc)+"&url="+encodeURIComponent(url)+"&zoneid="+zoneId+"&ispublic="+isPublic+moreCriteria.join("")+"&format="+format+"&passwordEnabled="+password+"&osTypeId="+osType+"&hypervisor="+hypervisor+"&response=json"),
					dataType: "json",
					success: function(json) {						  
						var result = json.registertemplateresponse;								
						if($("#template_type").val() == "self") {							   
						    templateJSONToTemplate(result.template[0], template);							   						    
						    changeGridRowsTotal(submenuContent.find("#grid_rows_total"), 1); 
						    loadingImg.hide();  
                            rowContainer.show();                                                          
                            
                            if(result.template.length > 1) {                               
                                for(var i=1; i<result.template.length; i++) {         
                                    var template2 = $("#vm_template_template").clone(true);                                                               
                                    templateJSONToTemplate(result.template[i], template2);	
                                    submenuContent.find("#grid_content").prepend(template2.fadeIn("slow"));	 	
                                    changeGridRowsTotal(submenuContent.find("#grid_rows_total"), 1);  
                                }                                     
                            }
						}
						else {
						    $("#template_type").val("self");
						    $("#template_type").change(); 
						}							                              			                  				
					},			
                    error: function(XMLHttpResponse) {		                   
	                    handleError(XMLHttpResponse);	
	                    template.slideUp("slow", function(){ $(this).remove(); } );							    
                    }							
				});
			},
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}).dialog("open");
		return false;
	});
			
	function templateJSONToTemplate(json, template) {			
		(index++ % 2 == 0)? template.addClass("dbsmallrow_odd"):template.addClass("dbsmallrow_even");	
		template.attr("id", "template"+json.id+"_zone"+json.zoneid);	
		template.data("templateId", json.id);
		template.data("zoneId",sanitizeXSS(json.zoneid));
		template.data("zoneName",sanitizeXSS(json.zonename));
		template.data("name", sanitizeXSS(json.name));			
					
		template.find("#template_id").text(json.id);
		template.find("#template_zone").text(json.zonename);
		template.find("#template_name").text(json.name);
		template.find("#template_display_text").text(json.displaytext);
		template.find("#template_account").text(json.account);
		if(json.size != null)
		    template.find("#template_size").text(convertBytes(parseInt(json.size)));
		
		var status = "Ready";
		if (json.isready == "false") {
			status = json.templatestatus;
		}
		template.find("#template_status").text(status);
		
		setDateField(json.created, template.find("#template_created"));
					
		/*
		if (json.bits == "32") 
			template.find("#template_bit").attr("src", "images/32bit_icon.gif");			
		if (json.requireshvm == "false")
			template.find("#template_hvm").attr("src", "images/hvm_nonselectedicon.gif");			
		*/
		if (json.passwordenabled == "false") 
			template.find("#template_password").attr("src", "images/password_nonselectedicon.gif");						
									
		if (json.ispublic == "false") 
			template.find("#template_public").attr("src", "images/public_nonselectedicon.gif");	
									
		if (json.isfeatured == "false") 
			template.find("#template_featured").attr("src", "images/featured_nonselectedicon.gif");	
		
		if (json.crossZones == "false") 
			template.find("#template_crosszones").attr("src", "images/crosszone_nonselectedicon.gif");			
		
		template.find("#template_ostype").text(json.ostypename);			
		
		// hide action link Edit, Copy, Create VM 			
		if ((isUser() && json.ispublic == "true" && !(json.domainid == g_domainid && json.account == g_account)) || json.id==DomRTemplateId || json.isready == "false") 
			template.find("#template_edit_container, #template_copy_container, #template_create_vm_container").hide();
		
		// hide action link Delete 			
		if (((isUser() && json.ispublic == "true" && !(json.domainid == g_domainid && json.account == g_account)) || json.id==DomRTemplateId) || (json.isready == "false" && json.templatestatus != null && json.templatestatus.indexOf("% Downloaded") != -1))
			template.find("#template_delete_container").hide();
		
		var dialogEditTemplate = $("#dialog_edit_template");
		var that = template;
		template.find("#template_edit").data("templateId", json.id).unbind("click").bind("click", function(event) {
			event.preventDefault();
			var id = $(this).data("templateId");
			var template = that;
			
			var oldName = json.name;
			var oldDesc = json.displaytext;			
			var oldIsPublic = json.ispublic;
			var oldIsFeatured = json.isfeatured;
			var oldPasswordEnabled = json.passwordenabled;
			var oldOsTypeId = json.ostypeid;
		
			dialogEditTemplate.find("#edit_template_name").val(oldName);
			dialogEditTemplate.find("#edit_template_display_text").val(oldDesc);				
			dialogEditTemplate.find("#edit_template_public").val(oldIsPublic);
			dialogEditTemplate.find("#edit_template_featured").val(oldIsFeatured);
			dialogEditTemplate.find("#edit_template_password").val(oldPasswordEnabled);
			dialogEditTemplate.find("#edit_template_os_type").val(oldOsTypeId);
							
			dialogEditTemplate
			.dialog('option', 'buttons', { 					
				"Save": function() { 	
				    var thisDialog = $(this);
				    					
					// validate values
				    var isValid = true;					
				    isValid &= validateString("Name", thisDialog.find("#edit_template_name"), thisDialog.find("#edit_template_name_errormsg"));
				    isValid &= validateString("Display Text", thisDialog.find("#edit_template_display_text"), thisDialog.find("#edit_template_display_text_errormsg"));			
				    if (!isValid) return;					
												
					var newName = trim(thisDialog.find("#edit_template_name").val());
					var newDesc = trim(thisDialog.find("#edit_template_display_text").val());	
					var newPasswordEnabled = thisDialog.find("#edit_template_password").val();
					var newOsTypeId = thisDialog.find("#edit_template_os_type").val();
					
					var array1 = [];
					if(newName!=oldName)
					    array1.push("&name="+encodeURIComponent(newName));
					if(newDesc!=oldDesc)
					    array1.push("&displaytext="+encodeURIComponent(newDesc));
					if(newPasswordEnabled!=oldPasswordEnabled)
					    array1.push("&passwordenabled="+newPasswordEnabled);						
					if(newOsTypeId!=oldOsTypeId)
					    array1.push("&ostypeid="+encodeURIComponent(newOsTypeId));
								
					if(array1.length > 0) {	
					    $.ajax({
						    data: createURL("command=updateTemplate&id="+id+array1.join("")+"&response=json"),
						    dataType: "json",
						    success: function(json) {
						        templateJSONToTemplate(json.updatetemplateresponse, template);								    					
						        //template.find("#template_name").text(newName);
							    //template.find("#template_display_text").text(newDesc);								
						    }
					    });
					}
																		
					var isModified = false;
					var newIsPublic = thisDialog.find("#edit_template_public").val();	 
					if(newIsPublic != oldIsPublic)
					    isModified = true;						       
					var moreCriteria = [];				
				    if(thisDialog.find("#edit_template_featured_container").css("display")!="none") {				
				        var newIsFeatured = thisDialog.find("#edit_template_featured").val();						    	
                        moreCriteria.push("&isfeatured="+newIsFeatured);
                        if(newIsFeatured != oldIsFeatured)
                            isModified = true;
                    }								
					if(isModified) {
					    $.ajax({
						    data: createURL("command=updateTemplatePermissions&id="+id+"&ispublic="+newIsPublic+"&isfeatured="+newIsFeatured+"&response=json"),
						    dataType: "json",
						    success: function(json) {								       					    
						        (newIsPublic=="true")? template.find("#template_public").attr("src", "images/public_selectedicon.gif"):template.find("#template_public").attr("src", "images/public_nonselectedicon.gif");
						        (newIsFeatured=="true")? template.find("#template_featured").attr("src", "images/featured_selectedicon.gif"):template.find("#template_featured").attr("src", "images/featured_nonselectedicon.gif");                       
                    		}
					    });
					}																	
					
					thisDialog.dialog("close");		
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				} 
			}).dialog("open");
		});
		var that = template;
		template.find("#template_delete").data("parentElementId", "template"+json.id+"_zone"+json.zoneid).unbind("click").bind("click", function(event) {				
			var moreCriteria = [];				
			var parentElementId = $(this).data("parentElementId");
			var thisTemplate = that;
			var id = thisTemplate.data("templateId");
			var name = thisTemplate.data("name");						
			var zoneId = thisTemplate.data("zoneId");
			if (zoneId != null) 
				moreCriteria.push("&zoneid="+zoneId);
							
			var htmlMsg; 
			if(json.crossZones == "true")
			    htmlMsg = "<p>Template <b>"+name+"</b> is used by all zones. Please confirm you want to delete it from all zones.</p>";
			else
			    htmlMsg = "<p>Please confirm you want to delete your template <b>"+name+"</b>.</p>";
				
			$("#dialog_confirmation")
			.html(htmlMsg)
			.dialog('option', 'buttons', { 					
				"Confirm": function() { 						
					$(this).dialog("close");
														
					var loadingImg = thisTemplate.find(".adding_loading");		
                    var rowContainer = thisTemplate.find("#row_container");    	                               
                    loadingImg.find(".adding_text").text("Deleting....");	
                    loadingImg.show();  
                    rowContainer.hide();                                           
                    
                    $.ajax({
		            data: createURL("command=deleteTemplate&id="+id+moreCriteria.join("")+"&response=json"),
	                    dataType: "json",
	                    success: function(json) {			                        				        
	                        var jobId = json.deletetemplateresponse.jobid;					                       
	                        var timerKey = "deleteTemplateJob"+jobId;
								    
	                        $("body").everyTime(2000, timerKey, function() {
			                    $.ajax({
						    data: createURL("command=queryAsyncJobResult&jobId="+json.deletetemplateresponse.jobid+"&response=json"),
				                    dataType: "json",
				                    success: function(json) {										       						   
					                    var result = json.queryasyncjobresultresponse;
					                    if (result.jobstatus == 0) {
						                    return; //Job has not completed
					                    } else {											    
						                    $("body").stopTime(timerKey);
						                    if (result.jobstatus == 1) { //success		
                                                that.slideUp("slow", function() { $(this).remove() });
							                    changeGridRowsTotal($("#submenu_content_template").find("#grid_rows_total"), -1);                                                        
						                    } else if (result.jobstatus == 2) {										        
							                    $("#dialog_alert").html("<p>" + sanitizeXSS(result.jobresult) + "</p>").dialog("open");		
							                    loadingImg.hide();  
                                                rowContainer.show();										   					    
						                    }
					                    }
				                    },
				                    error: function(XMLHttpResponse) {
					                    $("body").stopTime(timerKey);
					                    handleError(XMLHttpResponse);	
					                    loadingImg.hide();  
                                        rowContainer.show();									    
				                    }
			                    });
		                    }, 0);						    					
	                    },
	                    error: function(XMLHttpResponse) {							    
			                handleError(XMLHttpResponse);
			                loadingImg.hide();  
                            rowContainer.show();								
	                    }
                    });	  					
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				} 
			}).dialog("open");
		});
		template.find("#template_copy").data("parentElementId", "template"+json.id+"_zone"+json.zoneid).unbind("click").bind("click", function(event) {			
			var parentElementId = $(this).data("parentElementId");
			var thisTemplate = $("#"+parentElementId);
			var id = thisTemplate.data("templateId");
			var name = thisTemplate.data("name");						
			var sourceZoneId = thisTemplate.data("zoneId");				
					
			populateZoneField($("#dialog_copy_template #copy_template_zone"), sourceZoneId);
			
			$("#dialog_copy_template #copy_template_name_text").text(name);
			
			var sourceZoneName = thisTemplate.data("zoneName");
			$("#dialog_copy_template #copy_template_source_zone_text").text(sourceZoneName);
				
			$("#dialog_copy_template")
			.dialog('option', 'buttons', {				    
			    "OK": function() {				       
			        var thisDialog = $(this);
			        				        
			        var isValid = true;	 
                    isValid &= validateDropDownBox("Zone", thisDialog.find("#copy_template_zone"), thisDialog.find("#copy_template_zone_errormsg"), false);  //reset error text		         
			        if (!isValid) return;     
			        				        
			        var destZoneId = thisDialog.find("#copy_template_zone").val();				        				        
			        thisDialog.dialog("close");		        
			          				        
			        var loadingImg = thisTemplate.find(".adding_loading");		
                    var rowContainer = thisTemplate.find("#row_container");    	                               
                    loadingImg.find(".adding_text").text("Copying....");	
                    loadingImg.show();  
                    rowContainer.hide();                                           
                    
                    $.ajax({
		            data: createURL("command=copyTemplate&id="+id+"&sourcezoneid="+sourceZoneId+"&destzoneid="+destZoneId+"&response=json"), 
	                    dataType: "json",
	                    success: function(json) {			                        				        
	                        var jobId = json.copytemplateresponse.jobid;					                       
	                        var timerKey = "copyTemplateJob"+jobId;
								    
	                        $("body").everyTime(2000, timerKey, function() {
			                    $.ajax({
						    data: createURL("command=queryAsyncJobResult&jobId="+json.copytemplateresponse.jobid+"&response=json"),
				                    dataType: "json",
				                    success: function(json) {										       						   
					                    var result = json.queryasyncjobresultresponse;
					                    if (result.jobstatus == 0) {
						                    return; //Job has not completed
					                    } else {											    
						                    $("body").stopTime(timerKey);
						                    if (result.jobstatus == 1) {							                        
							                    $("#dialog_info").html("<p>Template download started (ID: <b>"+result.copytemplateresponse[0].id+"</b>, Zone: <b>"+sanitizeXSS(result.copytemplateresponse[0].zonename)+"</b>, Name: <b>"+sanitizeXSS(result.copytemplateresponse[0].name)+"</b>) . Check the progress...</p>").dialog("open");									                    
							                    loadingImg.hide();  
                                                rowContainer.show();	
                                                $("#template_type").val("self");
						                        $("#template_type").change();                                                         
						                    } else if (result.jobstatus == 2) {										        
							                    $("#dialog_alert").html("<p>" + sanitizeXSS(result.jobresult) + "</p>").dialog("open");		
							                    loadingImg.hide();  
                                                rowContainer.show();										   					    
						                    }
					                    }
				                    },
				                    error: function(XMLHttpResponse) {
					                    $("body").stopTime(timerKey);
					                    handleError(XMLHttpResponse);	
					                    loadingImg.hide();  
                                        rowContainer.show();									    
				                    }
			                    });
		                    }, 0);						    					
	                    },
	                    error: function(XMLHttpResponse) {							    
			                handleError(XMLHttpResponse);
			                loadingImg.hide();  
                            rowContainer.show();								
	                    }
                    });	     
			    }, 
			    "Cancel": function() {				        
				    $(this).dialog("close");
			    }				
			}).dialog("open");			
		});						
        template.find("#template_create_vm").data("parentElementId", "template"+json.id+"_zone"+json.zoneid).unbind("click").bind("click", function(event) {	
            createVMFromTemplateOrISO($(this), "template");		
		});			
	}
			
	function createVMFromTemplateOrISO(actionLink, sourceType) {					
		var parentElementId = actionLink.data("parentElementId");
		var thisTemplate = $("#"+parentElementId);			
		var id = (sourceType == "template")? thisTemplate.data("templateId"): thisTemplate.data("isoId");					
		var name = thisTemplate.data("name");						
		var zoneId = thisTemplate.data("zoneId");				
						
		var createVmDialog = $("#dialog_create_vm_from_template");				
		createVmDialog.find("#template").text(name);
			
		createVmDialog
		.dialog('option', 'buttons', {			    
		    "Create": function() {
		        var thisDialog = $(this);	
		        			        
		        // validate values
			    var isValid = true;		
			    isValid &= validateString("Name", thisDialog.find("#name"), thisDialog.find("#name_errormsg"), true);
			    isValid &= validateString("Group", thisDialog.find("#group"), thisDialog.find("#group_errormsg"), true);				
			    if (!isValid) return;	       
		                
		        var name = trim(thisDialog.find("#name").val());		
		        var group = trim(thisDialog.find("#group").val());		
		        var serviceOfferingId = thisDialog.find("#service_offering").val();				        
		        var diskOfferingId = thisDialog.find("#disk_offering").val();
		        thisDialog.dialog("close");
		        		        
		        var loadingImg = thisTemplate.find(".adding_loading");		
                var rowContainer = thisTemplate.find("#row_container");                                         	                               
                loadingImg.find(".adding_text").text("Creating VM....");	
                loadingImg.show();  
                rowContainer.hide();      
		        			        		        
                $.ajax({
		                data: createURL("command=deployVirtualMachine&zoneId="+zoneId+"&serviceOfferingId="+serviceOfferingId+"&diskOfferingId="+diskOfferingId+"&templateId="+id+"&group="+encodeURIComponent(group)+"&displayname="+encodeURIComponent(name)+"&response=json"),
			        dataType: "json",
			        success: function(json) {					            
				        var jobId = json.deployvirtualmachineresponse.jobid;						        
				        var timerKey = "newVMFromTemplate"+jobId;        						
				        
				        $("body").everyTime(
					        10000,
					        timerKey,
					        function() {
						        $.ajax({
							        data: createURL("command=queryAsyncJobResult&jobId="+jobId+"&response=json"),
							        dataType: "json",
							        success: function(json) {
								        var result = json.queryasyncjobresultresponse;
								        if (result.jobstatus == 0) {
									        return; //Job has not completed
								        } else {										            
									        $("body").stopTime(timerKey);											        
									        if (result.jobstatus == 1) {
										        // Succeeded													        
										        var htmlMsg;
										        if (result.virtualmachine[0].passwordenabled == 'true') 
											        htmlMsg = "Your instance from " + sanitizeXSS(name) + " has been successfully created.  Your new password is : <b>" + result.virtualmachine[0].password + "</b> .  Please change it as soon as you log into your new instance";
										        else 
											        htmlMsg = "Your instance from " + sanitizeXSS(name) + " has been successfully created.";												        
										        $("#dialog_info").html(htmlMsg).dialog("open");		
										        loadingImg.hide();  
                                                rowContainer.show();								       
									        } else if (result.jobstatus == 2) {
										        // Failed
										        $("#dialog_info").html("Unable to create your new instance from " + sanitizeXSS(name) + " due to the error: " + sanitizeXSS(result.jobresult)).dialog("open");	
										        loadingImg.hide();  
                                                rowContainer.show();
									        }
								        }
							        },
							        error: function(XMLHttpResponse) {
								        $("body").stopTime(timerKey);
								        handleError(XMLHttpResponse);
								        loadingImg.hide();  
                                        rowContainer.show();
							        }
						        });
					        },
					        0
				        );
			        },
			        error: function(XMLHttpResponse) {
			            handleError(XMLHttpResponse);
						loadingImg.hide();  
                        rowContainer.show();
			        }
		        });						         
		    }, 
		    "Cancel": function() {
		        $(this).dialog("close");
		    }
		}).dialog("open");			
	}
	
			
	function listTemplates() { 
	    var submenuContent = $("#submenu_content_template");	
							
		var type =  $("#template_type").val();	//my template, featured, community
        var commandString;            
		var advanced = submenuContent.find("#search_button").data("advanced");                    
		if (advanced != null && advanced) {		
		    var name = submenuContent.find("#advanced_search #adv_search_name").val();				 
		    var moreCriteria = [];								
			if (name!=null && trim(name).length > 0) 
				moreCriteria.push("&name="+encodeURIComponent(trim(name)));				
			commandString = "command=listTemplates&page="+currentPage+moreCriteria.join("")+"&templatefilter="+type+"&response=json";    
		} else {          
            var searchInput = $("#submenu_content_template #search_input").val();  //search button          
            if (searchInput != null && searchInput.length > 0) 
                commandString = "command=listTemplates&page="+currentPage+"&templatefilter="+type+"&keyword="+searchInput+"&response=json";
            else
                commandString = "command=listTemplates&page="+currentPage+"&templatefilter="+type+"&response=json"; 
        }

        //listItems(submenuContent, commandString, jsonResponse1, jsonResponse2, template, fnJSONToTemplate);         
        listItems(submenuContent, commandString, "listtemplatesresponse", "template", $("#vm_template_template"), templateJSONToTemplate);  			
	}
	
	submenuContentEventBinder($("#submenu_content_template"), listTemplates);
			
	$("#template_type").bind("change", function(event){		  
	    currentPage=1; 
	    event.preventDefault();   
	    listTemplates();
	});
	
	$("#submenu_template").bind("click",function(event){	
	    event.preventDefault();    
	    
	    $(this).toggleClass("submenu_links_on").toggleClass("submenu_links_off");
		currentSubMenu.toggleClass("submenu_links_off").toggleClass("submenu_links_on");
		currentSubMenu = $(this);  	
			
		var submenuContent = $("#submenu_content_template").show();
		$("#submenu_content_iso").hide();   		    
	    
	    currentPage=1;	 		    
	    listTemplates();
	});
			
	// *** Template (end) ***
	
		
	
    // *** ISO (begin) ***	
	activateDialog($("#dialog_edit_iso").dialog({ 
		width:450,
		autoOpen: false,
		modal: true,
		zIndex: 2000
	}));
	
	activateDialog($("#dialog_add_iso").dialog({ 
		width:450,
		autoOpen: false,
		modal: true,
		zIndex: 2000
	}));
	
	activateDialog($("#dialog_copy_iso").dialog({ 
		width:300,
		autoOpen: false,
		modal: true,
		zIndex: 2000
	}));
	
	$("#iso_action_new").show();		
	
	$("#iso_action_new").bind("click", function(event) {
		$("#dialog_add_iso")
		.dialog('option', 'buttons', { 				
			"Create": function() { 	
			    var thisDialog = $(this);
					
				// validate values
				var isValid = true;					
				isValid &= validateString("Name", thisDialog.find("#add_iso_name"), thisDialog.find("#add_iso_name_errormsg"));
				isValid &= validateString("Display Text", thisDialog.find("#add_iso_display_text"), thisDialog.find("#add_iso_display_text_errormsg"));
				isValid &= validateString("URL", thisDialog.find("#add_iso_url"), thisDialog.find("#add_iso_url_errormsg"));			
				if (!isValid) return;							
						
				var submenuContent = $("#submenu_content_iso");			      
                var template = $("#vm_iso_template").clone(true);	
				var loadingImg = template.find(".adding_loading");		
                var rowContainer = template.find("#row_container");    	                               
                loadingImg.find(".adding_text").text("Adding....");	
                loadingImg.show();  
                rowContainer.hide();                                   
                submenuContent.find("#grid_content").prepend(template.fadeIn("slow"));    
										
				var name = trim(thisDialog.find("#add_iso_name").val());
				var desc = trim(thisDialog.find("#add_iso_display_text").val());
				var url = trim(thisDialog.find("#add_iso_url").val());						
				var zoneId = thisDialog.find("#add_iso_zone").val();	
				//var isPublic = thisDialog.find("#add_iso_public").val();
				var isPublic = "false"; //default to private for now
				var osType = thisDialog.find("#add_iso_os_type").val();
				var bootable = thisDialog.find("#add_iso_bootable").val();			
			    				    
			    thisDialog.dialog("close");									    
			    				
				$.ajax({
				        data: createURL("command=registerIso&name="+encodeURIComponent(name)+"&displayText="+encodeURIComponent(desc)+"&url="+encodeURIComponent(url)+"&zoneId="+zoneId+"&isPublic="+isPublic+"&osTypeId="+osType+"&bootable="+bootable+"&response=json"),
					dataType: "json",
					success: function(json) {					
					    var result = json.registerisoresponse;					
						if($("#iso_type").val() == "self") {							   
						    isoJSONToTemplate(result.iso[0], template);  							   						   
						    changeGridRowsTotal(submenuContent.find("#grid_rows_total"), 1); 
						    loadingImg.hide();  
                            rowContainer.show();   
                            
                            if(result.iso.length > 1) {                               
                                for(var i=1; i<result.iso.length; i++) {         
                                    var template2 = $("#vm_iso_template").clone(true);                                                               
                                    isoJSONToTemplate(result.iso[i], template2);	
                                    submenuContent.find("#grid_content").prepend(template2.fadeIn("slow"));	 
                                    changeGridRowsTotal(submenuContent.find("#grid_rows_total"), 1); 	 
                                }                                    
                            }                                 
						}
						else {
						    $("#iso_type").val("self");
						    $("#iso_type").change(); 
						}		                          												
					},			
                    error: function(XMLHttpResponse) {		                   
	                    handleError(XMLHttpResponse);	
	                    template.slideUp("slow", function(){ $(this).remove(); } );							    
                    }					
				});
			},
			"Cancel": function() { 
				$(this).dialog("close"); 
			} 
		}).dialog("open");
		return false;
	});
		
	//*** isoJSONToTemplate (begin) *******************************
	function isoJSONToTemplate(json, template) {
	    template.attr("id", "iso"+json.id+"_zone"+json.zoneid);
		if (index++ % 2 == 0) {
			template.addClass("dbsmallrow_odd");
		} else {
			template.addClass("dbsmallrow_even");
		}
				
		template.data("isoId", json.id);
		template.data("zoneId",sanitizeXSS(json.zoneid));
		template.data("zoneName",sanitizeXSS(json.zonename));
		template.data("name", sanitizeXSS(json.name));		
		template.data("isPublic", json.ispublic);
		
		template.find("#iso_id").text(json.id);
		template.find("#iso_zone").text(json.zonename);
		template.find("#iso_name").text(json.name);
		template.find("#iso_display_text").text(json.displaytext);
					
		if(json.size != null)
		    template.find("#iso_size").text(convertBytes(parseInt(json.size)));
					
        var status = "Ready";
		if (json.isready == "false") {
			status = json.isostatus;
		}
		template.find("#iso_status").text(status);
		
		/*			
		if (json.ispublic == "false") 
			template.find("#iso_public").attr("src", "images/public_nonselectedicon.gif");	
		else
		    template.find("#iso_public").attr("src", "images/public_selectedicon.gif");	
		*/
		
		template.find("#iso_bootable").text((json.bootable == "true") ? "Yes" : "No");
		template.find("#iso_account").text(json.account);
		
		setDateField(json.created, template.find("#iso_created"));
					
		// hide action link Edit, Copy, Create VM 	
		if ((isUser() && json.ispublic == "true" && !(json.domainid == g_domainid && json.account == g_account)) || json.isready == "false") 
			template.find("#iso_edit_container, #iso_copy_container, #iso_create_vm_container").hide();
		
		// hide action link Delete 
		if (((isUser() && json.ispublic == "true" && !(json.domainid == g_domainid && json.account == g_account))) || (json.isready == "false" && json.isostatus != null && json.isostatus.indexOf("% Downloaded") != -1))
			template.find("#iso_delete_container").hide();
					
		// hide "Create VM" link  
		if(json.bootable == "false") // disallow to create VM from non-bootable ISO  
		    template.find("#iso_create_vm_container").hide();
		
		template.find("#iso_edit").data("isoId", json.id).bind("click", function(event) {
			event.preventDefault();
			var id = $(this).data("isoId");
			var iso = $("#iso"+id);
			var name = template.find("#iso_name").text();
			var displayText = template.find("#iso_display_text").text();
			$("#dialog_edit_iso #edit_iso_name").val(name);
			$("#dialog_edit_iso #edit_iso_display_text").val(displayText);
							
			$("#dialog_edit_iso")
			.dialog('option', 'buttons', { 					
				"Save": function() { 						
					// validate values
				    var isValid = true;					
				    isValid &= validateString("Name", $("#edit_iso_name"), $("#edit_iso_name_errormsg"));
				    isValid &= validateString("Display Text", $("#edit_iso_display_text"), $("#edit_iso_display_text_errormsg"));			
				    if (!isValid) return;
											
					var name = trim($("#edit_iso_name").val());
					var desc = trim($("#edit_iso_display_text").val());
											
					var dialogBox = $(this);
					dialogBox.dialog("close");
					$.ajax({
					        data: createURL("command=updateIso&id="+id+"&name="+encodeURIComponent(name)+"&displayText="+encodeURIComponent(desc)+"&response=json"),
						dataType: "json",
						success: function(json) {								    					    	
						    isoJSONToTemplate(json.updateisoresponse, template);										    
							//template.find("#iso_name").text(name);
							//template.find("#iso_display_text").text(desc);								
						}
					});
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				}
			}).dialog("open");
		});
		var that = template;
		template.find("#iso_delete").data("parentElementId", "iso"+json.id+"_zone"+json.zoneid).bind("click", function(event) {			
			var moreCriteria = [];						
			var parentElementId = $(this).data("parentElementId");
			var thisTemplate = that;
			var id = thisTemplate.data("isoId");
			var name = thisTemplate.data("name");						
			var zoneId = thisTemplate.data("zoneId");
			if (zoneId != null) 
				moreCriteria.push("&zoneid="+zoneId);		
			
			var htmlMsg; 
			if(json.crossZones == "true")
			    htmlMsg = "<p>ISO <b>"+name+"</b> is used by all zones. Please confirm you want to delete it from all zones.</p>";
			else
			    htmlMsg = "<p>Please confirm you want to delete your ISO <b>"+name+"</b>.</p>";
							
			$("#dialog_confirmation")
			.html(htmlMsg)
			.dialog('option', 'buttons', { 					
				"Confirm": function() { 			
					$(this).dialog("close");
						
					var loadingImg = thisTemplate.find(".adding_loading");		
                    var rowContainer = thisTemplate.find("#row_container");    	                               
                    loadingImg.find(".adding_text").text("Deleting....");	
                    loadingImg.show();  
                    rowContainer.hide();                                           
                    
                    $.ajax({
		            data: createURL("command=deleteIso&id="+id+moreCriteria.join("")+"&response=json"),
	                    dataType: "json",
	                    success: function(json) {			                        				        
	                        var jobId = json.deleteisosresponse.jobid;					                       
	                        var timerKey = "deleteIsoJob"+jobId;
								    
	                        $("body").everyTime(2000, timerKey, function() {
			                    $.ajax({
						    data: createURL("command=queryAsyncJobResult&jobId="+json.deleteisosresponse.jobid+"&response=json"),
				                    dataType: "json",
				                    success: function(json) {										       						   
					                    var result = json.queryasyncjobresultresponse;
					                    if (result.jobstatus == 0) {
						                    return; //Job has not completed
					                    } else {											    
						                    $("body").stopTime(timerKey);
						                    if (result.jobstatus == 1) { //success		
                                                that.slideUp("slow", function() { $(this).remove() });
							                    changeGridRowsTotal($("#submenu_content_iso").find("#grid_rows_total"), -1);                                                        
						                    } else if (result.jobstatus == 2) {										        
							                    $("#dialog_alert").html("<p>" + sanitizeXSS(result.jobresult) + "</p>").dialog("open");		
							                    loadingImg.hide();  
                                                rowContainer.show();										   					    
						                    }
					                    }
				                    },
				                    error: function(XMLHttpResponse) {
					                    $("body").stopTime(timerKey);
					                    handleError(XMLHttpResponse);	
					                    loadingImg.hide();  
                                        rowContainer.show();									    
				                    }
			                    });
		                    }, 0);						    					
	                    },
	                    error: function(XMLHttpResponse) {							    
			                handleError(XMLHttpResponse);
			                loadingImg.hide();  
                            rowContainer.show();								
	                    }
                    });	     				
				}, 
				"Cancel": function() { 
					$(this).dialog("close"); 
				}
			}).dialog("open");
		});
		
		template.find("#iso_copy").data("parentElementId", "iso"+json.id+"_zone"+json.zoneid).bind("click", function(event) {						   
			var moreCriteria = [];				
			var parentElementId = $(this).data("parentElementId");
			var thisTemplate = $("#"+parentElementId);
			var id = thisTemplate.data("isoId");
			var name = thisTemplate.data("name");						
			var sourceZoneId = thisTemplate.data("zoneId");
			if (sourceZoneId != null) 
				moreCriteria.push("&sourcezoneid="+sourceZoneId);
						
			populateZoneField($("#dialog_copy_iso #copy_iso_zone"), sourceZoneId);
			
			$("#dialog_copy_iso #copy_iso_name_text").text(name);  //ISO name
			
			var sourceZoneName = thisTemplate.data("zoneName");
			$("#dialog_copy_iso #copy_iso_source_zone_text").text(sourceZoneName); // source zone
				
			$("#dialog_copy_iso")
			.dialog('option', 'buttons', {				    
			    "OK": function() {				       
			        var thisDialog = $(this);
			        				        
			        var isValid = true;	 
                    isValid &= validateDropDownBox("Zone", thisDialog.find("#copy_iso_zone"), thisDialog.find("#copy_iso_zone_errormsg"), false);  //reset error text		         
			        if (!isValid) return;     
			        				        
			        var destZoneId = thisDialog.find("#copy_iso_zone").val();				        				        
			        thisDialog.dialog("close");		        
			          				        
			        var loadingImg = thisTemplate.find(".adding_loading");		
                    var rowContainer = thisTemplate.find("#row_container");    	                               
                    loadingImg.find(".adding_text").text("Copying....");	
                    loadingImg.show();  
                    rowContainer.hide();                                           
                    
                    $.ajax({
		            data: createURL("command=copyIso&id="+id+"&sourcezoneid="+sourceZoneId+"&destzoneid="+destZoneId+"&response=json"), 
	                    dataType: "json",
	                    success: function(json) {			                        				        
	                        var jobId = json.copyisoresponse.jobid;					                       
	                        var timerKey = "copyIsoJob"+jobId;
								    
	                        $("body").everyTime(2000, timerKey, function() {
			                    $.ajax({
						    data: createURL("command=queryAsyncJobResult&jobId="+json.copyisoresponse.jobid+"&response=json"),
				                    dataType: "json",
				                    success: function(json) {										       						   
					                    var result = json.queryasyncjobresultresponse;
					                    if (result.jobstatus == 0) {
						                    return; //Job has not completed
					                    } else {											    
						                    $("body").stopTime(timerKey);
						                    if (result.jobstatus == 1) {								                    
							                    $("#dialog_info").html("<p>ISO download started (ID: <b>"+result.copytemplateresponse[0].id+"</b>, Zone: <b>"+sanitizeXSS(result.copytemplateresponse[0].zonename)+"</b>, Name: <b>"+sanitizeXSS(result.copytemplateresponse[0].name)+"</b>) . Check the progress...</p>").dialog("open");                                                                                
							                    loadingImg.hide();  
                                                rowContainer.show();	
                                                currentPage=1;  //refresh the whole ISO grid until Keshav changes copyIso to return the newly created ISO.
                                                listIsos();                                                   
						                    } else if (result.jobstatus == 2) {										        
							                    $("#dialog_alert").html("<p>" + sanitizeXSS(result.jobresult) + "</p>").dialog("open");		
							                    loadingImg.hide();  
                                                rowContainer.show();										   					    
						                    }
					                    }
				                    },
				                    error: function(XMLHttpResponse) {
					                    $("body").stopTime(timerKey);
					                    handleError(XMLHttpResponse);	
					                    loadingImg.hide();  
                                        rowContainer.show();									    
				                    }
			                    });
		                    }, 0);						    					
	                    },
	                    error: function(XMLHttpResponse) {							    
			                handleError(XMLHttpResponse);
			                loadingImg.hide();  
                            rowContainer.show();								
	                    }
                    });	     
			    }, 
			    "Cancel": function() {				        
				    $(this).dialog("close");
			    }				
			}).dialog("open");			
		});					
		template.find("#iso_create_vm").data("parentElementId", "iso"+json.id+"_zone"+json.zoneid).bind("click", function(event) {				    	
            createVMFromTemplateOrISO($(this), "iso");		
		});			
	}
	//*** isoJSONToTemplate (end) *******************************
		
	function listIsos() {		
	    var submenuContent = $("#submenu_content_iso");		   
    	
    	var type =  $("#iso_type").val();	//my template, community    							
		var commandString;            
		var advanced = submenuContent.find("#search_button").data("advanced");                    
		if (advanced != null && advanced) {		
		    var name = submenuContent.find("#advanced_search #adv_search_name").val();				  
		    var moreCriteria = [];								
			if (name!=null && trim(name).length > 0) 
				moreCriteria.push("&name="+encodeURIComponent(trim(name)));			
			commandString = "command=listIsos&page="+currentPage+moreCriteria.join("")+"&isofilter="+type+"&response=json";    
		} else {          
		    var searchInput = $("#submenu_content_iso #search_input").val(); //keyword  				    
            if (searchInput != null && searchInput.length > 0) 
                commandString = "command=listIsos&page="+currentPage+"&keyword="+searchInput+"&isofilter="+type+"&response=json"
            else
                commandString = "command=listIsos&page="+currentPage+"&isofilter="+type+"&response=json";  
        }			
	
	    //listItems(submenuContent, commandString, jsonResponse1, jsonResponse2, template, fnJSONToTemplate);         
        listItems(submenuContent, commandString, "listisosresponse", "iso", $("#vm_iso_template"), isoJSONToTemplate);  
	}
	
    submenuContentEventBinder($("#submenu_content_iso"), listIsos);
	
	$("#iso_type").bind("change", function(event){		  
	    currentPage=1; 
	    event.preventDefault();   
	    listIsos();
	});
	
	$("#submenu_iso").bind("click", function(event) {	
	    event.preventDefault();  
	    
	    $(this).toggleClass("submenu_links_on").toggleClass("submenu_links_off");
		currentSubMenu.toggleClass("submenu_links_off").toggleClass("submenu_links_on");
		currentSubMenu = $(this);  		
		
		var submenuContent = $("#submenu_content_iso").show();
		$("#submenu_content_template").hide();
		
		currentPage=1;	   		    
	    listIsos();
	});		
	
	// *** ISO (end) ***	
	
	
	
	var currentSubMenu = $("#submenu_template");
	currentSubMenu.click();	
			
	if(isAdmin())
	    $("#dialog_add_template #add_template_featured_container, #dialog_edit_template #edit_template_featured_container").show();
	else
	    $("#dialog_add_template #add_template_featured_container, #dialog_edit_template #edit_template_featured_container").hide();	
}
