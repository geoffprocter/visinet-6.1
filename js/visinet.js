//event listeners
if(document.domain==''){var in_app=1;}else{var in_app=0;}//determines if being loaded in app or online for testing
if(in_app==0){$().ready(device_ready);}
document.addEventListener('deviceready',device_ready,false);
document.addEventListener('pause',on_page_pause,false);
document.addEventListener('resume',on_page_resume,false);

/*
document.addEventListener("deviceready", function(){
    //You can simply use acquire function in deviceready like following. 
    window.powermanagement.acquire(); 
}, false);
*/
//global variables
var server='http://procter.nz/visinet';
var default_vehicle_abbreviations_array=[['WATERLOO','WL'],['PARA','PM'],['PORI','PA'],['JOHN','JV'],['THOR','TN'],['NEWT','NA'],['LOWE','LH'],['UPPE','UH'],['WN','W'],['WAIN','WN'],['TGO','T'],['WGTN','W'],['Wgtn','W'],['WEL','W'],['KAPITI','K'],['OSC','O'],['AIRX','AT'],['HQ','H'],['RESC','RE'],['MASTE','MT'],['OHARFRG','OHA'],['OTAK','OT'],['LEVI','LV'],['FEIL','FE'],['PALM','PN'],['GREYT','GT'],['WAIRA','R'],['FCOMMCTR','FIRE'],['PNTH','P'],['MARTI','MA'],['FEATH','FE'],['T1PA','T1P'],['ClinicalA1','Nurse Auck'],['WFAMED1','CSD Wgtn'],['ClinicalW','Nurse Wgtn'],['ClinicalW1','Nurse Wgtn'],['EKET','EK'],['WOOD','WV'],['MWT','MW'],['DELTA','D'],['SER1K','S1K'],['SER2PA','S2P'],
                                        
                                        ['Nurse WgtnA','Nurse Wgtn'],['Nurse WgtnB','Nurse Wgtn'],['Nurse WgtnC','Nurse Wgtn'],
                                        ['Nurse AuckA','Nurse Auck'],['Nurse AuckB','Nurse Auck'],['Nurse AuckC','Nurse Auck'],
                                        ];
var default_location_abbreviations_array=[['Pilmuir St [Hhed]','HHED'],['Riddiford St [Wph Ed]','WPH ED'],['Riddiford St & Regina Tce [Wph Delivery Suite]','WPH Delivery'],['Wph Mapu','WPH MAPU'],['863 Fergusson Dr [@Upper Hutt Police Station]','UH Police Station'],['Hospital Dr [Kgh A&m (Kenepuru General Hospital)]','KGH'],['Wfa HQ','WFA HQ'],['Blair St & Te Ore Ore Rd [Wairarapa Ed]','MT ED']];
var default_permanent_exclusions_array=['NEWT','PARA','PORI','HHED','JOHN','THOR','UPPE','KGHED','WAIN','WNAPT','WNPOLICE','WNWPSTAD','WPHCC','WPHED','A3WEL','TGO1KAPITI','LOWE','FSWFA','FCOMMCTR1','FCOMMCTR5','GT','MT','WRED','NATPARKFRG','WSPARE','FIRE4','ICTC','ICTC2','ICTC3','CART','KGHEOC','WAIKHC','WFASM','WPHEOC','CCS-W','MANB','WLIFEFLT'];
var default_eas_inclusions_array=[];
var default_oos_exclusions_array=['MWT1','HQ1WN','HQ2WN','HQ3WN','HQ4WN','RESC1','RESC2','TGO1WGTN','TGO3WN','MI1Wgtn','MI2Wgtn','OHARFRG','TGO4WN','A1WEL','O5W','MA1','FE1','O1R','DELTA11','DELTA6','ICTC','OT81','WFAMED1','H6CEN','ICT3W','ICTC2','PM3','ClinicalW','T1R','H1W','H3W','CCS-WFPTS','KGHEOC','WAIKHC','WFASM','WPHEOC'];
var purple='#ff99ff';
var red1='#ff9999';
var red2='#ffcccc';
var orange1='#ffd280';
var orange2='#ffe8bf';
var green1='#80ff80';
var green2='#ccffcc';
var grey='#cccccc';
var white='#f5f5f5';
var get_queues_ajax_in_progress=0;

//startup functions
function device_ready(){
	//power mgmt
	if(in_app){window.powermanagement.acquire();}//keep screen awake
    //hide status bar
    if(in_app){StatusBar.hide();}
	//enable fastclick
	FastClick.attach(document.body);
	//if vehicle arrays not set, set them
	if(window.localStorage.getItem('vehicle_abbreviations_array')  == null){window.localStorage.setItem('vehicle_abbreviations_array',join2Darray(default_vehicle_abbreviations_array));}
	if(window.localStorage.getItem('location_abbreviations_array') == null){window.localStorage.setItem('location_abbreviations_array',join2Darray(default_location_abbreviations_array));}
	if(window.localStorage.getItem('permanent_exclusions_array')   == null){window.localStorage.setItem('permanent_exclusions_array',default_permanent_exclusions_array.toString());}
	if(window.localStorage.getItem('eas_inclusions_array')	       == null){window.localStorage.setItem('eas_inclusions_array',default_eas_inclusions_array.toString());}
	if(window.localStorage.getItem('oos_exclusions_array')	       == null){window.localStorage.setItem('oos_exclusions_array',default_oos_exclusions_array.toString());}
	if(window.localStorage.getItem('display_vehicles')	     	   == null){window.localStorage.setItem('display_vehicles','eas');}
    //page changes
	check_login();
	}
function on_page_pause(){
	var current_time=Math.round(new Date().getTime()/1000);
	window.localStorage.setItem('paused_at_timestamp',current_time);
	}
function on_page_resume(){
	//timer settings
	var paused_at_timestamp=eval(window.localStorage.getItem('paused_at_timestamp'));
	var history_updated_timestamp=window.localStorage.getItem('history_updated_timestamp');
	var current_time=Math.round(new Date().getTime()/1000);
	if(current_time>(eval(history_updated_timestamp)+(30*60))){//if history more than 30mins old
		$('.waiting_div').show();
		$('#vehicle_table').html('');
		$('#pending_table').html('');
		hide_kpis();
		get_queues();
		}
	}

//login & logout functions
function check_login(){
    if(in_app){StatusBar.hide();}
	if(window.localStorage.getItem('app_username')===null){incorrect_login_details();}
	else{$('.waiting_div').show();get_queues();}
	}
function incorrect_login_details(){
	$.mobile.changePage($('#login_page'));
	window.localStorage.removeItem('dsid');
	window.localStorage.removeItem('vpn_username');
	window.localStorage.removeItem('vpn_password');
	window.localStorage.removeItem('visinet_username');
	window.localStorage.removeItem('visinet_password');
	window.localStorage.removeItem('app_username');
	window.localStorage.removeItem('app_password');
	}
function login(){
	if($('#app_username').val()==''||$('#app_password').val()==''||$('#vpn_username').val()==''||$('#vpn_password').val()==''||$('#visinet_username').val()==''||$('#visinet_password').val()==''){show_message('Please fill out all fields','Error');}
	else{$('.waiting_div').show();get_queues();}
	}
function confirm_logout(){
	if(in_app==1){navigator.notification.confirm('Are you sure you want to logout?',logout,'Logout?','Logout,Cancel');}
	else{var r=confirm('Are you sure you want to logout?');if(r==true){logout(1)}}
	}
function logout(button){
	if(button==1){
		$('#progress_bar').stop();
		get_history_ajax.abort();//incase reload currently in progress
		get_queues_ajax.abort();//incase reload currently in progress
		//need to purge cookie details if they end up being held client side
		$.mobile.changePage($('#login_page'));
		$('#vpn_username').val('');
		$('#vpn_password').val('');
		$('#visinet_username').val('');
		$('#visinet_password').val('');
		$('#app_username').val('');
		$('#app_password').val('');
		window.localStorage.removeItem('dsid');
		window.localStorage.removeItem('vpn_username');
		window.localStorage.removeItem('vpn_password');
		window.localStorage.removeItem('visinet_username');
		window.localStorage.removeItem('visinet_password');
		window.localStorage.removeItem('app_username');
		window.localStorage.removeItem('app_password');
		}
	}
function request_login(){
	//variables
	var first_name=escape($('#first_name').val());
	var last_name=escape($('#last_name').val());
	var company=escape($('#company').val());
	var position=escape($('#position').val());
	var email=escape($('#email').val());
	//validation
	if(first_name==''){show_message('Please enter a first name','Error');return;}
	if(last_name==''){show_message('Please enter a last name','Error');return;}
	if(company==''){show_message('Please enter a company','Error');return;}
	if(position==''){show_message('Please enter a position','Error');return;}
	if(email==''){show_message('Please enter an email','Error');return;}
	if(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)==false){show_message('Please enter a valid email','Error');return;}
	//ajax
	$('.waiting_div').show();
	$.ajax({
		url:server+'/server_files/process_misc.php',
		type:'POST',
		data:{type:'request_login',first_name:first_name,last_name:last_name,company:company,position:position,email:email}})
	.fail(function(jqXHR,textStatus,errorThrown){
		show_message('2: Connection failed, try again...','Error');
		$('.waiting_div').hide();
		})
	.done(function(data){
		if($(data).filter('result').html()=="request submitted"||$(data).filter('result').html()=="email already exists"){
			$('#first_name').val('');
			$('#last_name').val('');
			$('#company').val('');
			$('#position').val('');
			$('#email').val('');
			if($(data).filter('result').html()=="request submitted"){
				show_message('Your request has been submitted, you will recieve login details via the email you supplied.','Success');
				$.mobile.changePage($('#login_page'));}
			else if($(data).filter('result').html()=="email already exists"){show_message('Email already exists. Please try password recovery.','Error');}
			}
		else{show_message('Please try submitting again.','Error');}
		$('.waiting_div').hide();
		})
	}
function recover_password(){
	//variables
	var email=escape($('#recover_password_email').val());
	//validation
	if(email==''){show_message('Please enter an email','Error');return;}
	if(/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)==false){show_message('Please enter a valid email','Error');return;}
	//ajax
	$('.waiting_div').show();
	$.ajax({
		url:server+'/server_files/process_misc.php',
		type:'POST',
		data:{type:'recover_password',email:email}})
	.fail(function(jqXHR,textStatus,errorThrown){
		show_message('8: Connection failed, try again...','Error');
		$('.waiting_div').hide();
		})
	.done(function(data){
		if($(data).filter('result').html()=='request submitted'){
			$('#recover_password_email').val('');
			show_message('Your request has been submitted, you will recieve login details via your registered email.','Success');
			$.mobile.changePage($('#login_page'));}
		else{show_message('Please try submitting again.','Error');}
		$('.waiting_div').hide();
		})
	}
function change_app_password(){
	//variables
	var app_username=window.localStorage.getItem('app_username');
	var current_app_password=$('#current_app_password').val();
	var new_app_password_1=$('#new_app_password_1').val();
	var new_app_password_2=$('#new_app_password_2').val();
	//validation
	if(current_app_password==''||new_app_password_1==''||new_app_password_2==''){show_message('Please fill in all boxes.','Error');return;}
	if(new_app_password_1!=new_app_password_2){show_message('New passwords do not match.','Error');return;}
	if(new_app_password_1.length<6||new_app_password_1.length>20){show_message('New password must be between 6 and 20 characters.','Error');return;}
	//make safe (needs to happen after validation because of symbols ie '!' > '%21' changing length)
	app_username=escape(app_username);
	current_app_password=escape(current_app_password);
	new_app_password_1=escape(new_app_password_1);

	//ajax
	$('.waiting_div').show();
	$.ajax({
		url:server+'/server_files/process_misc.php',
		type:'POST',
		data:{
			type:'change_app_password',
			app_username:app_username,
			current_app_password:current_app_password,
			new_app_password:new_app_password_1
			}
		})
	.fail(function(jqXHR,textStatus,errorThrown){
		show_message('7: Connection failed, try again...','Error');
		$('.waiting_div').hide();
		})
	.done(function(data){
		if($(data).filter('result').html()=='password changed'){
			$('#current_app_password').val('');
			$('#new_app_password_1').val('');
			$('#new_app_password_2').val('');
			$('#app_password').val(new_app_password_1);
			window.localStorage.setItem('app_password',new_app_password_1);
			show_message('Your password has been changed.','Success');
			$.mobile.changePage($('#settings_page'),{transition:'none',reverse:true});}
		else{show_message('Please try submitting again.','Error');}
		$('.waiting_div').hide();
		})
	}
function change_vpn_password(){
	//variables
	var vpn_username=$('#current_vpn_username').val();
	var current_vpn_password=$('#current_vpn_password').val();
	var new_vpn_password_1=$('#new_vpn_password_1').val();
	var new_vpn_password_2=$('#new_vpn_password_2').val();
	var state_id=$('state_id').html();

	//validation
	if(current_vpn_password==''||new_vpn_password_1==''||new_vpn_password_2==''){show_message('Please fill in all boxes.','Error');return;}
	if(new_vpn_password_1!=new_vpn_password_2){show_message('New passwords do not match.','Error');return;}
	if(new_vpn_password_1.replace(/[^A-Z]/g,'').length<1){show_message('New password requires at least one uppercase letter.','Error');return;}
	if(new_vpn_password_1.replace(/[^a-z]/g,'').length<1){show_message('New password requires at least one lowercase letter.','Error');return;}
	if(new_vpn_password_1.replace(/[^0-9]/g,'').length<1){show_message('New password requires at least one number.','Error');return;}
	if(new_vpn_password_1.replace(/[A-Za-z0-9]/g,'').length<1){show_message('New password requires at least one symbol.','Error');return;}
	if(new_vpn_password_1.length<6||new_vpn_password_1.length>20){show_message('New password must be between 6 and 20 characters.','Error');return;}
	//make safe (needs to happen after validation because of symbols ie '!' > '%21' changing length)
	//vpn_username=escape(vpn_username);
	//current_vpn_password=escape(current_vpn_password);
	//new_vpn_password_1=escape(new_vpn_password_1);
	//ajax
	$('.waiting_div').show();
	$.ajax({
		url:server+'/server_files/process_misc.php',
		type:'POST',
		data:{type:'change_vpn_password',vpn_username:vpn_username,current_vpn_password:current_vpn_password,new_vpn_password:new_vpn_password_1,state_id:state_id},
		})
	.fail(function(jqXHR,textStatus,errorThrown){
		show_message('7: Connection failed, try again...','Error');
		$('.waiting_div').hide();
		})
	.done(function(data){
		if($(data).filter('result').html()=="password changed"){
			$('#current_vpn_password').val('');
			$('#new_vpn_password_1').val('');
			$('#new_vpn_password_2').val('');
			$('#vpn_password').val(new_vpn_password_1);
			window.localStorage.setItem('vpn_password',new_vpn_password_1);
			show_message('Your password has been changed.','Success');
			$.mobile.changePage($('#vehicles_page'));
			check_login();}
		else{show_message('Please try submitting again.','Error');}
		$('.waiting_div').hide();
		})
	}

//queues functions
function get_queues(attempt){
	if(get_queues_ajax_in_progress!=1){
		//variables
		var dsid=window.localStorage.getItem('dsid');
		var url=server+'/server_files/get_queues.php';
		if(window.localStorage.getItem('app_username')	 === null){var app_username=$('#app_username').val();}else{var app_username=window.localStorage.getItem('app_username')}
		if(window.localStorage.getItem('app_password')	 === null){var app_password=$('#app_password').val();}else{var app_password=window.localStorage.getItem('app_password')}
		if(window.localStorage.getItem('vpn_username')	 === null){var vpn_username=$('#vpn_username').val();}else{var vpn_username=window.localStorage.getItem('vpn_username')}
		if(window.localStorage.getItem('vpn_password')	 === null){var vpn_password=$('#vpn_password').val();}else{var vpn_password=window.localStorage.getItem('vpn_password')}
		if(window.localStorage.getItem('visinet_username') === null){var visinet_username=$('#visinet_username').val();}else{var visinet_username=window.localStorage.getItem('visinet_username')}
		if(window.localStorage.getItem('visinet_password') === null){var visinet_password=$('#visinet_password').val();}else{var visinet_password=window.localStorage.getItem('visinet_password')}
		var region=$('#region').val();

		//page changes
		$('#reload_button_stopped').hide();
		$('#reload_button_spinning').show();
//        $('#reload_button img').removeClass('pause');//removed 3.3
        $('#progress_bar').stop();
		//ajax
        get_queues_ajax_in_progress=1;
		get_queues_ajax=$.ajax({url:url,type:'POST',data:{region:region,vpn_username:vpn_username,vpn_password:vpn_password,visinet_username:visinet_username,visinet_password:visinet_password,app_username:app_username,app_password:app_password,dsid:dsid
//              .debug:'debug'
             }})
		.fail(function(jqXHR,textStatus,errorThrown){
			get_queues_ajax_in_progress=0;
			if(attempt==null||attempt<10){
				if(attempt==null){attempt=0;}else{attempt++;}
				setTimeout(function(){get_queues(attempt)},2000);
				}
			else{
				$('#reload_button img').addClass('pause');
				$('.waiting_div').show();
				$('.waiting_div_text').html('Connection lost with server.</br>Try <a style="text-decoration:underline;color:#fff" onclick="get_queues();$(\'.waiting_div\').hide();$(\'.waiting_div_text\').html(\'\');">reloading</a>.');}
			})
		.done(function(u){
			//page changes
			get_queues_ajax_in_progress=0;
			attempt=0;
			//load queues
			$('#queues').html(u);
			if($('#queues error').length>0){
				if($('error').html()=='VPN Password Needs Changing'){//test at next chance
					$.mobile.changePage($('#change_vpn_password_page'));}//test at next chance
				else{
					show_message($('error').html(),'Error');
					incorrect_login_details();
					}}
			else{
				//change page
				if($.mobile.activePage.attr('id')=='login_page'){$.mobile.changePage($('#vehicles_page'));}//stops transition if on unit or job page
				//log dsid on page & in memory (after queues put into #queues)
				var dsid=$('dsid').html();
				//store variables
				window.localStorage.setItem('dsid',dsid);
				window.localStorage.setItem('app_username',app_username);$('#app_username').val('');
				window.localStorage.setItem('app_password',app_password);$('#app_password').val('');
				window.localStorage.setItem('vpn_username',vpn_username);$('#vpn_username').val('');
				window.localStorage.setItem('vpn_password',vpn_password);$('#vpn_password').val('');
				window.localStorage.setItem('visinet_username',visinet_username);$('#visinet_username').val('');
				window.localStorage.setItem('visinet_password',visinet_password);$('#visinet_password').val('');
				//get queues get history
				get_history();//make it only if wfa & allowed
				get_kpis_basic();//make it only if wfa & allowed
				process_pending();
				process_queues();
				//make page changes
				$('#progress_bar').stop().css('width','0%').animate({'width':'100%'},60000,'linear',function(){get_queues()});
				$('#reload_button img').addClass('pause');
                $('#reload_button_stopped').show();
                $('#reload_button_spinning').hide();
				if($('login').html()=='Login'){
                    $('#reload_button_stopped').attr('src','css/images/reload-32-red.png');
                    $('#reload_button_spinning').attr('src','css/images/reload-32-red.png');
                    }
                else{
                    $('#reload_button_stopped').attr('src','css/images/reload-32.png');
                    $('#reload_button_spinning').attr('src','css/images/reload-32.png');
                    }
				}
			$('.waiting_div').hide();
			})
		}
	}
function get_history(){
	//variables
	var url=server+'/server_files/get_history.php';
	var dsid=window.localStorage.getItem('dsid');
	var app_username=window.localStorage.getItem('app_username');
	var app_password=window.localStorage.getItem('app_password');

	//ajax
	get_history_ajax=$.ajax({url:url,type:'POST',data:{app_username:app_username,app_password:app_password,dsid:dsid}})
	.fail(function(jqXHR,textStatus,errorThrown){$('#history').html(errorThrown);})
	.done(function(u){
		if(u!=''){$('#history_instructions').show();}
		window.localStorage.setItem('history_updated_timestamp',Math.round(new Date().getTime()/1000));
		$('#history').html(u);
		$('.waiting_div').hide();
		})
	}
function get_kpis_basic(){
	//variables
	var url=server+'/server_files/process_kpis_basic.php';
	var dsid=window.localStorage.getItem('dsid');
	var app_username=window.localStorage.getItem('app_username');
	var app_password=window.localStorage.getItem('app_password');

	//ajax
	get_history_ajax=$.ajax({url:url,type:'POST',data:{app_username:app_username,app_password:app_password,dsid:dsid}})
	.fail(function(jqXHR,textStatus,errorThrown){$('#kpis').html(errorThrown);})
	.done(function(u){
		$('#kpis').html(u);
		process_kpis();
		$('.waiting_div').hide();
		})
	}
function process_pending(){
	//create pending array
	var pqa=[];
	$('#queues pending_queue job').each(function(x){
		var job_href=$(this).find('job_href').html();
		var priority=$(this).find('priority').html();
		var job_type=$(this).find('job_type').html();
		var location=$(this).find('location').html();location=format(location);
		var location_city=$(this).find('location_city').html();location_city=format(location_city);
		var time=$(this).find('time').html();
		var job_colour=white;
		var colour_rank;
		if(priority=='A PUR'){colour_rank=5;job_colour=purple;}
		if(priority=='B RE1'){colour_rank=4;job_colour=red1;}
		if(priority=='B RE2'){colour_rank=4;job_colour=red2;}
		if(priority=='C OR1'){colour_rank=3;job_colour=orange1;}
		if(priority=='C OR2'){colour_rank=3;job_colour=orange2;}
		if(priority=='D GRN1'){colour_rank=2;job_colour=green1;}
		if(priority=='D GRN2'){colour_rank=2;job_colour=green2;}
		if(priority=='E GRY'){colour_rank=1;job_colour=grey;}
		if(priority=='J PTS'){colour_rank=1;job_colour=grey;}
		if(priority=='K NTF'){colour_rank=0;job_colour=white;}
		pqa.push(new Array(job_href,job_type,location,location_city,time,job_colour,colour_rank))
		})

	//sort array
	pqa.sort(function(a,b){
		//sort by time (oldest at top)
		if((/day/g.test(a[4]))){//if time contains 'day' add '999' at front to push after time such as 10pm
			a[4]=a[4].replace(/\s/g,'').replace(/days/g,'').replace(/day/g,'').replace(/&gt;/g,'');
			if((/^\d{1}$/g.test(a[4]))){a[4]='9990'+a[4];}//if number days 1-9
			else{a[4]='999'+a[4];}//if number days 10+
			}
		if((/days/g.test(b[4]))){//if time contains 'days' add '999' at front to push after time such as 10pm
			b[4]=b[4].replace(/\s/g,'').replace(/days/g,'').replace(/day/g,'').replace(/&gt;/g,'');
			if((/^\d{1}$/g.test(b[4]))){b[4]='9990'+b[4];}//if number days 1-9
			else{b[4]='999'+b[4];}////if number days 10+
			}
		if(a[4]<b[4]){return -1;}
		else if(a[4]>b[4]){return 1;}
		return 0;
		});

	//format time & res (has to happen after sort)
	$(pqa).each(function(x){
		pqa[x][4]=pqa[x][4].replace(/^0+/,'');
		pqa[x][4]=pqa[x][4].replace(/^:+/,'');
		pqa[x][4]=pqa[x][4].replace(/^0+/,'');
		if(/99901/g.test(pqa[x][4])){pqa[x][4]='1d';}
		if(/9990[2-7]/g.test(pqa[x][4])){pqa[x][4]=pqa[x][4].replace('9990','')+'d';}
		if(/9990[8-9]/g.test(pqa[x][4])){pqa[x][4]='7d+';}
		if(/999/g.test(pqa[x][4])){pqa[x][4]='7d+';}
		});

	//insert array
	var y=0;
	var rows='';
	var highest_colour_rank=0;
	var display_vehicles=window.localStorage.getItem('display_vehicles');
	$(pqa).each(function(x){
		var display=0;
		if(display_vehicles=='eas'){if(pqa[x][1].match(/^60/)==null){display=1;}}
		if(display_vehicles=='all'){display=1;}
		if(display==1){
			rows+='<tr class="pending_row" id="pending_row_'+x+'" style="background:'+pqa[x][5]+'" onclick="load_job_info(\''+pqa[x][0]+'\',\'vehicles_page\')">';
			rows+='<td>'+pqa[x][1]+'</td>';
			rows+='<td>  '+pqa[x][2]+', '+pqa[x][3]+'</td>';
			rows+='<td style="text-align:right;">'+pqa[x][4]+'</td>';
			rows+='</tr>';
			if(pqa[x][6]>highest_colour_rank){highest_colour_rank=pqa[x][6];}
			y++;}
		})
	$('#number_pending').val(y);
	//hide or show pending_jobs & make adjustments
	if(y==0){//if no pending jobs
		$('#pending_table').hide();
		$('#pending_jobs_notification_outer').css('background-color',white);
		$('.pending_row').remove();}
	else{//if pending jobs
		//add jobs to list
		$('.pending_row').remove();
		$('#pending_table').append(rows);
		var colour=white;
		if(highest_colour_rank==8){colour=purple;}
		if(highest_colour_rank==7){colour=red1;}
		if(highest_colour_rank==6){colour=red2;}
		if(highest_colour_rank==5){colour=orange1;}
		if(highest_colour_rank==4){colour=orange2;}
		if(highest_colour_rank==3){colour=green1;}
		if(highest_colour_rank==2){colour=green2;}
		if(highest_colour_rank==1){colour=grey;}
		$('#pending_jobs_notification_outer').css('background-color',colour);
		if(y!=1){var s='s';}else{var s='';}
		if($('login').html()=='1'){var login='. ';}else{var login='';}
		$('#pending_table').show();
		}
	}
function process_queues(){
	//create array
	var uqa=[];
    var uka=[];
	var location_abbreviations_array = split2Darray(window.localStorage.getItem('location_abbreviations_array'));
	var vehicle_abbreviations_array  = split2Darray(window.localStorage.getItem('vehicle_abbreviations_array'));
	var permanent_exclusions_array   = window.localStorage.getItem('permanent_exclusions_array').split(',');
	var eas_inclusions_array		 = window.localStorage.getItem('eas_inclusions_array').split(',');
	var oos_exclusions_array		 = window.localStorage.getItem('oos_exclusions_array').split(',');
	if(window.localStorage.getItem('flagged_blue_units_array')==null){var flagged_blue_units_array=[];}else{var flagged_blue_units_array=window.localStorage.getItem('flagged_blue_units_array').split(',');}

    //validate input data
    if($('#history history_data').length){var uha=$.parseJSON($('#history history_data').html());}
    if($('#kpis current_shift_vehicle_kpis').length){var uka=$.parseJSON($('#kpis current_shift_vehicle_kpis').html());}
    if(!$('#queues unit_queue unit').length){get_queues();return;}

    //otherwise go nuts
    $('#queues unit_queue unit').each(function(x){
		//variables
		var vehicle_href=$(this).find('unit_href').html();    if(!vehicle_href){vehicle_href='';}
		var vehicle=$(this).find('callsign').html();          if(!vehicle){vehicle='';}
		$(vehicle_abbreviations_array).each(function(x){vehicle=vehicle.replace(vehicle_abbreviations_array[x][0],vehicle_abbreviations_array[x][1]);});
		var vehicle_full=$(this).find('callsign').html();     if(!vehicle_full){vehicle_full='';}
		var status=$(this).find('status').html();             if(!status){status='';}
		var job_href=$(this).find('job_href').html();         if(!job_href){job_href='';}
		var job_type=$(this).find('job_type').html();         if(!job_type){job_type='';}
		var priority=$(this).find('priority').html();         if(!priority){priority='';}
		var job_colour=white;
		if(priority=='A PRP'){job_colour=purple;}
		if(priority=='B RE1'){job_colour=red1;}
		if(priority=='B RE2'){job_colour=red2;}
		if(priority=='C OR1'){job_colour=orange1;}
		if(priority=='C OR2'){job_colour=orange2;}
		if(priority=='D GR1'){job_colour=green1;}
		if(priority=='D GR2'){job_colour=green2;}
		if(priority=='E GRY'){job_colour=grey;}
		if(priority=='J PTS'){job_colour=grey;}
		if(status=='07 - Multi Assign'||status=='07 - Multi Assign'||status=='20 - Responding 2nd Loc'||status=='21 - At Scene 2nd Location'){job_colour=grey;}
		var location=$(this).find('location').html();if(location=='&nbsp;'||location=='&Nbsp;'){location='';}location=format(location);                                   if(!location){location='';}
		var destination=$(this).find('destination').html();if(destination=='&nbsp;'||destination=='&Nbsp;'){destination='';}destination=format(destination);              if(!destination){destination='';}
		var job_city=$(this).find('job_city').html();if(job_city=='&nbsp;'||job_city=='&Nbsp;'){job_city='';}job_city=format(job_city);                                   if(!job_city){job_city='';}
		var job_location=$(this).find('job_location').html();if(job_location=='&nbsp;'||job_location=='&Nbsp;'){job_location='';}job_location=format(job_location);       if(!job_location){job_location='';}
		var time=$(this).find('time').html();                if(!time){time='';}
		var excluded=0;
		$(permanent_exclusions_array).each(function(){if(this==vehicle||this==vehicle_full){excluded=1;}})
		//display
		var display=1;
		if(window.localStorage.getItem('display_vehicles')=='eas'){
			if((/[2-3][0-9]/g.test(vehicle))==true){display=0;}//exclude PTS
			if((/9[0-9]/g.test(vehicle))==true){display=0;}//exclude events
			if(/^[0-3][0-9]/.test(job_type)==true){display=1;}//include all 01-39 codes
			if($.inArray(vehicle_full,flagged_blue_units_array)!==-1){display=1;}//include flagged vehicles
			if($.inArray(vehicle,eas_inclusions_array)!==-1){display=1;}//include short name eas_inclusions
			if($.inArray(vehicle_full,eas_inclusions_array)!==-1){display=1;}//include long name eas_inclusions
			if($.inArray(vehicle,oos_exclusions_array)!==-1&&status=='16 - Out Of Service'){display=0;}//exclude short name oos (after eas_inclusions in case vehicle on both lists)
			if($.inArray(vehicle_full,oos_exclusions_array)!==-1&&status=='16 - Out Of Service'){display=0;}}//exclude long name oos (after eas_inclusions in case vehicle on both lists)

		var percent='';
		var breaks_array=[];
		var events_array=[];
		if($('#history history_data').length){
			$.each(uha,function(a){
				if(vehicle_full==uha[a][0]){
					percent=uha[a][1];
					$.each(uha[a][2],function(b){breaks_array.push(new Array(uha[a][2][b][1],uha[a][2][b][2]))});
					$.each(uha[a][3],function(c){events_array.push(new Array(uha[a][3][c][1],uha[a][3][c][2]))});
					}
				});
			}
		if(excluded==0){
			uqa.push(new Array(vehicle,status,job_href,job_type,location,destination,time,job_colour,vehicle_href,vehicle_full,display,job_location,job_city,percent,breaks_array,events_array))
			}
		})

	//convert for sorting
	$(uqa).each(function(x){
/*
		if(uqa[x][1]=='01 - Dispatched'){uqa[x][1]='01'}
		if(uqa[x][1]=='02 - Responding'){uqa[x][1]='02'}
		if(uqa[x][1]=='14 - Staged'){uqa[x][1]='03'}
		if(uqa[x][1]=='03 - At Scene'){uqa[x][1]='04'}
		if(uqa[x][1]=='14 - Events On Scene'){uqa[x][1]='05'}
		if(uqa[x][1]=='04 - Pt Contact'){uqa[x][1]='06'}
		if(uqa[x][1]=='05 - Depart Scene'){uqa[x][1]='07'}
		if(uqa[x][1]=='06 - At Destination'){uqa[x][1]='08'}
		if(uqa[x][1]=='07 - Multi Assign'){uqa[x][1]='09'}
		if(uqa[x][1]=='08 - Delayed Available'){uqa[x][1]='10'}
		if(uqa[x][1]=='09 - Available On Scene'){uqa[x][1]='11'}
		if(uqa[x][1]=='10 - Available'){uqa[x][1]='11'}
		if(uqa[x][1]=='13 - Assign to Post'){uqa[x][1]='12'}
		if(uqa[x][1]=='11 - Enroute to Stn'){uqa[x][1]='13'}
		if(uqa[x][1]=='12 - Local Area'){uqa[x][1]='14'}
		if(uqa[x][1]=='15 - In Quarters'){uqa[x][1]='15'}
		if(uqa[x][1]=='16 - Out of Service'){uqa[x][1]='16'}
		if(uqa[x][1]=='17 - Shift Pending'){uqa[x][1]='17'}
		if(uqa[x][1]=='19 - Dispatched 2nd Loc'){uqa[x][1]='19'}
		if(uqa[x][1]=='20 - Responding 2nd Loc'){uqa[x][1]='20'}
		if(uqa[x][1]=='21 - At Scene 2nd Location'){uqa[x][1]='21'}
*/        
        
        if(uqa[x][1]=='01 - Dispatched'){uqa[x][1]='01'}
		if(uqa[x][1]=='02 - Responding'){uqa[x][1]='02'}
		if(uqa[x][1]=='03 - Staged'){uqa[x][1]='03'}
		if(uqa[x][1]=='04 - At Scene'){uqa[x][1]='04'}
        if(uqa[x][1]=='05 - Pt Contact'){uqa[x][1]='06'}		
		if(uqa[x][1]=='06 - Depart Scene'){uqa[x][1]='07'}
		if(uqa[x][1]=='07 - At Destination'){uqa[x][1]='08'}
		if(uqa[x][1]=='10 - Multi-Assign'){uqa[x][1]='09'}
		if(uqa[x][1]=='08 - Delayed Available'){uqa[x][1]='10'}
		if(uqa[x][1]=='09 - Available On Scene'){uqa[x][1]='11'}
		if(uqa[x][1]=='11 - Available'){uqa[x][1]='11'}
		if(uqa[x][1]=='13 - Assign To Post'){uqa[x][1]='12'}
		if(uqa[x][1]=='14 - Enroute to Stn'){uqa[x][1]='13'}
		if(uqa[x][1]=='12 - Local Area'){uqa[x][1]='14'}
		if(uqa[x][1]=='15 - In Quarters'){uqa[x][1]='15'}
		if(uqa[x][1]=='16 - Out Of Service'){uqa[x][1]='16'}
		if(uqa[x][1]=='17 - Shift Pending'){uqa[x][1]='17'}
		if(uqa[x][1]=='19 - Dispatched 2nd Loc'){uqa[x][1]='19'}
		if(uqa[x][1]=='20 - Responding 2nd Loc'){uqa[x][1]='20'}
		if(uqa[x][1]=='21 - At Scene 2nd Location'){uqa[x][1]='21'}
		});

	//sort array
	uqa.sort(function(a,b){
		var index=1;
		if(a[index]<b[index]){return -1;}
		else if(a[index]>b[index]){return 1;}
		else if(a[index]===b[index]){
			//if status the same, sort by time
			var index=6;
			if((/day/g.test(a[index]))){//if time contains 'day' add '9' at front to push after time such as 10pm
				a[index]=a[index].replace(/\s/g,'').replace(/days/g,'').replace(/day/g,'').replace(/&gt;/g,'');
				if((/^\d{1}$/g.test(a[index]))){a[index]='9990'+a[index];}//if number days 1-9
				else{a[index]='999'+a[index];}//if number days 10+
				}
			if((/days/g.test(b[index]))){//if time contains 'days' add '9' at front to push after time such as 10pm
				b[index]=b[index].replace(/\s/g,'').replace(/days/g,'').replace(/day/g,'').replace(/&gt;/g,'');
				if((/^\d{1}$/g.test(b[index]))){b[index]='9990'+b[index];}//if number days 1-9
				else{b[index]='999'+b[index];}//if number days 10+
				}
			if(a[index]<b[index]){return -1;}
			else if(a[index]>b[index]){return 1;}
			return 0;
			}
		});

	//format time & res (has to happen after sort)
	$(uqa).each(function(x){
		if(uqa[x][1]=='01'){uqa[x][1]='DIS'}
		if(uqa[x][1]=='02'){uqa[x][1]='RES'}
		if(uqa[x][1]=='03'){uqa[x][1]='SGD'}
		if(uqa[x][1]=='04'){uqa[x][1]='SCN'}
		if(uqa[x][1]=='05'){uqa[x][1]='SCN'}
		if(uqa[x][1]=='06'){uqa[x][1]='CON'}
		if(uqa[x][1]=='07'){uqa[x][1]='TRA'}
		if(uqa[x][1]=='08'){uqa[x][1]='DES'}
		if(uqa[x][1]=='09'){uqa[x][1]='MUL'}
		if(uqa[x][1]=='10'){uqa[x][1]='DEL'}
		if(uqa[x][1]=='11'){uqa[x][1]='AVA'}
		if(uqa[x][1]=='12'){uqa[x][1]='ASS'}
		if(uqa[x][1]=='13'){uqa[x][1]='RTN'}
		if(uqa[x][1]=='14'){uqa[x][1]='LOC'}
		if(uqa[x][1]=='15'){uqa[x][1]='STN'}
		if(uqa[x][1]=='16'){uqa[x][1]='OOS'}
		if(uqa[x][1]=='17'){uqa[x][1]='PEN'}
		if(uqa[x][1]=='19'){uqa[x][1]='DIS2'}
		if(uqa[x][1]=='20'){uqa[x][1]='RES2'}
		if(uqa[x][1]=='21'){uqa[x][1]='SCN2'}
        if(uqa[x][6]){
            uqa[x][6]=uqa[x][6].replace(/^0+/,'');
            uqa[x][6]=uqa[x][6].replace(/^:+/,'');
            uqa[x][6]=uqa[x][6].replace(/^0+/,'');
            if(/99901/g.test(uqa[x][6])){uqa[x][6]='1d';}
            if(/9990[2-7]/g.test(uqa[x][6])){uqa[x][6]=uqa[x][6].replace('9990','')+'d';}
            if(/9990[8-9]/g.test(uqa[x][6])){uqa[x][6]='7d+';}
            if(/999/g.test(uqa[x][6])){uqa[x][6]='7d+';}
            }
		});

	//insert array
	var y=0;
	var last_status='';
	var row='';
	$('.vehicle_row').remove();
	$('.vehicle_history_row').remove();
	$(uqa).each(function(x){
		var display=uqa[x][10];
		if(display==1){
			var vehicle=uqa[x][0];
			var status=uqa[x][1];
			var job_href=uqa[x][2];
			var job_type=uqa[x][3];
			var location=uqa[x][4];
			var destination=uqa[x][5];
			var time=uqa[x][6];
			var job_colour=uqa[x][7];
			var vehicle_href=uqa[x][8];
			var vehicle_full=uqa[x][9];
			var job_location=uqa[x][11];
			var job_city=uqa[x][12];
			var percent=uqa[x][13];
			var breaks_array=uqa[x][14];
			var events_array=uqa[x][15];

			//get greater of chute & div widths
			var temp_width=0;;
			if(uka && uka[vehicle_full.toLowerCase()]){
				if(uka[vehicle_full.toLowerCase()]['chute'].length){temp_width=parseInt(uka[vehicle_full.toLowerCase()]['chute'].length)*4;}
				if(uka[vehicle_full.toLowerCase()]['destination'].length){
					if(parseInt(uka[vehicle_full.toLowerCase()]['destination'].length)*4>temp_width)
						{temp_width=parseInt(uka[vehicle_full.toLowerCase()]['destination'].length)*4;}
					}
				}

			row+='<tr class="vehicle_row" id="vehicle_row_'+x+'" style="background:'+job_colour+';">';
			row+='<td style="min-width:';
			row+=temp_width;
			row+='px"><div class="kpi_bar_outer">';

			//chute kpis
			if(uka && uka[vehicle_full.toLowerCase()]){
				row+='<div class="kpi_chute_div" style="width:';
				if(uka[vehicle_full.toLowerCase()]['chute'].length){row+=parseInt(uka[vehicle_full.toLowerCase()]['chute'].length)*4;}
				row+='px">';
				$(uka[vehicle_full.toLowerCase()]['chute']).each(function(x){
					var chute=uka[vehicle_full.toLowerCase()]['chute'][x];
					row+='<span style="background:';
					if(chute<=45){row+='green1';}
					else if(chute<=90){row+='orange1';}
					else if(chute<=135){row+='red1';}
					else{row+='magenta';}
					row+='" class="kpi_bar';
					if(uka[vehicle_full.toLowerCase()]['station'][x]==0){row+=' off_station';}
					//if(chute>180){row+=' kpi_flash';}
					row+='"></span>';
					});}
			row+='</div>';

			row+='<div style="clear:both"></div>'

			//destination kpis
			if(uka && uka[vehicle_full.toLowerCase()]){
				row+='<div class="kpi_destination_div" style="width:';
				if(uka[vehicle_full.toLowerCase()]['destination'].length){row+=parseInt(uka[vehicle_full.toLowerCase()]['destination'].length)*4;}
				row+='px">';
				$(uka[vehicle_full.toLowerCase()]['destination']).each(function(x){
					var destination=uka[vehicle_full.toLowerCase()]['destination'][x];
					row+='<span style="background:';
					if(destination<=1200){row+='green1';}
					else if(destination<=1800){row+='orange1';}
					else if(destination<=2400){row+='red1';}
					else{row+='magenta';}
					row+='" class="kpi_bar';
					//if(destination>2400){row+=' kpi_flash';}
					row+='"></span>';
					});}
			row+='</div>';

			row+='</div></td><td class="vehicle_number" onclick="load_unit_info(\''+vehicle_href+'\')"><div>'+vehicle+'</div><div>';
			if(percent){row+=percent+'%&nbsp;';}
			$(breaks_array).each(function(a){
				if(breaks_array[a][1]!='i'){
					if(breaks_array[a][0]){row+='<span class="late">'+breaks_array[a][1]+'</span>';}//if late
					else{row+='<span>'+breaks_array[a][1]+'</span>';}//if not late
					}})
			row+='</div>';
			row+='</td>';
			if(job_type!=''){//if on a job
					if(status=='MUL'){row+='<td>';}
					else{row+='<td onclick="load_job_info(\''+job_href+'\',\'vehicles_page\')">';}
					if(status=='RES'||status=='DIS'||status=='SGD'){
						row+='<b>L:</b> '+location+'<br/>';
						row+='<b>'+job_type+'</b>';
						if(job_location!=''){row+=' - '+job_location+', '+job_city;}
						else{row+=' - '+destination;}}//for jobs outside region (ie A1W)
					else if(status=='SCN'||status=='CON'){
						row+='<b>'+job_type+'</b>';
						if(job_location!=''){row+=' - '+job_location+', '+job_city;}
						else{row+=' - '+location;}}//for vehicles where job_location isnt set (ie A1W outside region)
					else if(status=='TRA'){
						row+='<b>'+job_type+'</b>';
						if(job_location!=''){row+=' - '+job_location+', '+job_city;}
						row+='<br/>';
						row+='<b>L:</b> '+location+'<br/>';
						row+='<b>D:</b> '+destination;}
					else if(status=='DES'||status=='DEL'){
						row+='<b>'+job_type+'</b>';
						if(job_location!=''){row+=' - '+job_location+', '+job_city;}
						row+='<br/>';
						row+='<b>D:</b> '+destination+'<br/>';}
					else if(status=='MUL'){
						var job_type_array=job_type.split(';');
						var job_href_array=job_href.split(';');
						var job_location_array=job_location.split(';');
						var job_city_array=job_city.split(';');
						$(job_type_array).each(function(c){
							row+='<div onclick="load_job_info(\''+job_href_array[c]+'\',\'vehicles_page\')"><b>'+job_type_array[c]+'</b>';
							if(job_location_array[c]!=''){row+=' - '+format(job_location_array[c])+', '+format(job_city_array[c]);}
							row+='</div>';})
						row+='<b>L:</b> '+location+'<br/>';
						row+='<b>D:</b> '+destination+'<br/>';}
					row+='</td>';}
			else{//if not on a job
				row+='<td>';
					if(status=='RTN'||status=='ASS'){
						row+='<b>L:</b> '+location+'<br/>';
						row+='<b>D:</b> '+destination+'<br/>';}
					else{row+=location;}
				row+='</td>';}
			row+='<td ';
			if($.inArray(vehicle_full,flagged_blue_units_array)!==-1){row+='class="flagged_blue" ';}
			row+='onclick="add_flag_to_unit(\''+vehicle_full+'\',this)">';

			//convert time to seconds for warnings
			var ts=time.split(':');
			if(/d/i.test(ts)){seconds=null;}
			else if(ts.length==1){seconds=eval(ts[0]);}
			else if(ts.length==2){seconds=eval(ts[1])+eval(ts[0]*60);}
			else if(ts.length==3){seconds=eval(ts[2])+eval(ts[1]*60)+eval(ts[0]*60*60);}
			//warnings
			if(status=='SCN'&&seconds>=300){row+='<span class="vehicle_flash">';}
			else if(status=='DES'&&seconds>=1200){row+='<span class="vehicle_flash">';}
			else{row+='<span>';}
			row+='<span class="vehicle_status">'+status+'</span><br/>';

			row+=time+'</span></td></tr>';
			var total_events_width=0;
			$(events_array).each(function(b){
				if(b==0){row+='<tr class="vehicle_history_row"><td colspan="4">';}
				var span_class=events_array[b][1];
				if(span_class=='job'){
					if(b==events_array.length-1){//last unknown job (ie current event)
						if(job_colour==purple){span_class='purple';}
						if(job_colour==red1){span_class='red1';}
						if(job_colour==red2){span_class='red2';}
						if(job_colour==orange1){span_class='orange1';}
						if(job_colour==orange2){span_class='orange2';}
						if(job_colour==green1){span_class='green1';}
						if(job_colour==green2){span_class='green2';}
						if(job_colour==grey){span_class='grey';}
						}
					}//actual unknown
				total_events_width=total_events_width+eval(events_array[b][0]);
				if(total_events_width<100){row+='<span class="'+span_class+'" style="width:'+events_array[b][0]+'%;"></span>';}//only adds event if under 100% screen width (stops vehicles working late from going onto second line)
				if(b==events_array.length-1){if($(window).width()>(($(window).width()/100*total_events_width)+2)){row+='<span class="end"></span></td></tr>';}}//only add end marker if not close to end of screen
				})
			y++;
			last_status=status;
			}
		$('.waiting_div').hide();
		})
	$('#vehicle_table').append(row);
	if($('#vehicle_table').html()==''){
    	if(in_app==1){navigator.notification.alert('Error - Reloading now',callback,title);}else{alert('Error - Reloading now');}
		window.localStorage.removeItem('dsid');
		get_queues();
		}
	}
function process_kpis(){
	if($('current_shift_kpis').length){
		//process current shift kpis
		var kpi=$.parseJSON($('current_shift_kpis').html());
		//if(kpi['job_count']!=null&&kpi['assign']!=null&&kpi['chute']!=null&&kpi['response']!=null&&kpi['destination']!=null){
			$('#top_bar td').eq(0).html(kpi['job_count']);
			if(kpi['assign']=='-'){$('#top_bar td').eq(1).html(kpi['assign']);}else{$('#top_bar td').eq(1).html(kpi['assign']+'s');}
			if(kpi['chute']=='-'){$('#top_bar td').eq(2).html(kpi['chute']);}else{$('#top_bar td').eq(2).html(kpi['chute']+'s');}
			if(kpi['response']=='-'){$('#top_bar td').eq(3).html(kpi['response']);}else{$('#top_bar td').eq(3).html(kpi['response']+'%');}
			$('#top_bar td').eq(4).html(kpi['destination']);
			//add colours to kpis
			$('#top_bar td').eq(1).css('background',green1);
			$('#top_bar td').eq(2).css('background',green1);
			$('#top_bar td').eq(3).css('background',green1);
			$('#top_bar td').eq(4).css('background',green1);
			if(kpi['assign']>135){$('#top_bar td').eq(1).css('background',purple)}else if(kpi['assign']>90){$('#top_bar td').eq(1).css('background',red1)}else if(kpi['assign']>45){$('#top_bar td').eq(1).css('background',orange1)}
			if(kpi['chute']>135){$('#top_bar td').eq(2).css('background',purple)}else if(kpi['chute']>90){$('#top_bar td').eq(2).css('background',red1)}else if(kpi['chute']>45){$('#top_bar td').eq(2).css('background',orange1)}
			if(kpi['response']<30){$('#top_bar td').eq(3).css('background',purple)}else if(kpi['response']<40){$('#top_bar td').eq(3).css('background',red1)}else if(kpi['response']<50){$('#top_bar td').eq(3).css('background',orange1)}
			if(kpi['destination'].substring(0,2)>=40){$('#top_bar td').eq(4).css('background',purple)}else if(kpi['destination'].substring(0,2)>=30){$('#top_bar td').eq(4).css('background',red1)}else if(kpi['destination'].substring(0,2)>=20){$('#top_bar td').eq(4).css('background',orange1)}
			show_kpis();
		//	}
		}
	}
function change_display_vehicles(value){
	window.localStorage.setItem('display_vehicles',value);
	//$('#display_vehicles').val(value);
	if(value=='eas'){$('#eas_button').addClass('active');$('#all_button').removeClass('active');
    StatusBar.show();
                    }
	if(value=='all'){$('#all_button').addClass('active');$('#eas_button').removeClass('active');
    StatusBar.hide();
                    }
	process_queues();
	process_pending();
	}
function reload_queues(){
	if(window.localStorage.getItem('display_vehicles')=='eas'){$('#eas_button').addClass('active');$('#all_button').removeClass('active');}
	if(window.localStorage.getItem('display_vehicles')=='all'){$('#all_button').addClass('active');$('#eas_button').removeClass('active');}
	get_queues();
	}

//details functions
function open_kpi_page(){
	$.mobile.changePage('#kpi_page',{transition:'slidedown'});

	var current_day=1;
	if($('#kpis_data td').eq(2).html()!='-'){current_day=2;}
	if($('#kpis_data td').eq(3).html()!='-'){current_day=3;}
	if($('#kpis_data td').eq(4).html()!='-'){current_day=4;}

	var main_page_job_count=$('#top_bar td').eq(0).html();
	var main_page_assign=$('#top_bar td').eq(1).html();
	var main_page_chute=$('#top_bar td').eq(2).html();
	var main_page_response=$('#top_bar td').eq(3).html();
	var main_page_destination=$('#top_bar td').eq(4).html();

	var kpi_page_job_count=$('#kpis_data td').eq(current_day).html();
	var kpi_page_assign=$('#kpis_data td').eq(current_day+5).html();
	var kpi_page_chute=$('#kpis_data td').eq(current_day+10).html();
	var kpi_page_response=$('#kpis_data td').eq(current_day+15).html();
	var kpi_page_destination=$('#kpis_data td').eq(current_day+20).html();

	if(main_page_job_count==kpi_page_job_count && main_page_assign==kpi_page_assign && main_page_chute==kpi_page_chute && main_page_response==kpi_page_response && main_page_destination==kpi_page_destination){return;}

	//variables
	var url=server+'/server_files/process_kpis_by_shift.php';
	var app_username=window.localStorage.getItem('app_username');
	var app_password=window.localStorage.getItem('app_password');

	//ajax
	$('.waiting_div').show();
	request=$.ajax({url:url,type:'POST',data:{app_username:app_username,app_password:app_password}})
	.fail(function(jqXHR,textStatus,errorThrown){})
	.done(function(u){
		$('#kpis_raw').html(u);
		var row='';
		var i=1;
		var shift_kpi=$.parseJSON($('shift_kpi_data').html());
		var staff_kpi=$.parseJSON($('staff_kpi_data').html());
		var job_kpi=$.parseJSON($('job_kpi_data').html());
		$.each(shift_kpi,function(period_key,period_array){
			row+='<div class="period_div">';
			row+='<div class="kpi_title">'+period_key+'</div>';

			//shift kpis
			row+='<table class="shift_kpi_table';
			if(period_key=='Current Blue Block'){row+=' blue_block';}
			if(period_key=='Current Red Block'){row+=' red_block';}
			if(period_key=='Current Brown Block'){row+=' brown_block';}
			if(period_key=='Current Green Block'){row+=' green_block';}
			if(period_key=='Month To Date'||period_key=='Previous Month'||period_key=='Anteprevious Month'){row+='_all';}
			row+='">';
			if(period_key!='Current Shift'){
				if(period_key=='Current Blue Block'||period_key=='Current Red Block'||period_key=='Current Brown Block'||period_key=='Current Green Block'){row+='<thead><tr><th>KPI</th><th>Day 1</th><th>Day 2</th><th>Night 1</th><th>Night 2</th>';}
				else{row+='<thead><tr><th>KPI</th><th>Red</th><th>Brown</th><th>Blue</th><th>Green</th>';}
				if(period_key=='Month To Date'||period_key=='Previous Month'||period_key=='Anteprevious Month'){row+='<th>All</th>';}
				else{'<td></td>';}
				row+='</tr></thead>';}
			$.each(period_array,function(kpi_key,kpi_array){
				if(period_key=='Current Blue Block'||period_key=='Current Red Block'||period_key=='Current Brown Block'||period_key=='Current Green Block'){row+='<tr><td>'+kpi_key+'</td><td>'+kpi_array['Day 1']+'</td><td>'+kpi_array['Day 2']+'</td><td>'+kpi_array['Night 1']+'</td><td>'+kpi_array['Night 2']+'</td>';}
				else{row+='<tr><td>'+kpi_key+'</td><td>'+kpi_array['red']+'</td><td>'+kpi_array['brown']+'</td><td>'+kpi_array['blue']+'</td><td>'+kpi_array['green']+'</td>';}
				if(period_key=='Month To Date'||period_key=='Previous Month'||period_key=='Anteprevious Month'){row+='<td class="filled">'+kpi_array['all']+'</td>'}
				row+='</tr>';
				})
			row+='</table>';

			row+='<div class="show_hide_button_left" id="job_kpi_table_show_button_'+i+'" onclick="$(\'#job_kpi_table_'+i+'\').show();$(\'#job_kpi_table_hide_button_'+i+'\').show();$(\'#job_kpi_table_show_button_'+i+'\').hide();$(\'#staff_kpi_table_'+i+'\').hide();$(\'#staff_kpi_table_hide_button_'+i+'\').hide();$(\'#staff_kpi_table_show_button_'+i+'\').show();">Show job breakdown &#x25BC;</div>';
			row+='<div class="show_hide_button_left" id="job_kpi_table_hide_button_'+i+'" onclick="$(\'#job_kpi_table_'+i+'\').hide();$(\'#job_kpi_table_hide_button_'+i+'\').hide();$(\'#job_kpi_table_show_button_'+i+'\').show();" style="display:none">Hide job breakdown &#x25B2;</div>';
//			row+='<div class="show_hide_button_right" id="staff_kpi_table_show_button_'+i+'" onclick="$(\'#staff_kpi_table_'+i+'\').show();$(\'#staff_kpi_table_hide_button_'+i+'\').show();$(\'#staff_kpi_table_show_button_'+i+'\').hide();$(\'#job_kpi_table_'+i+'\').hide();$(\'#job_kpi_table_hide_button_'+i+'\').hide();$(\'#job_kpi_table_show_button_'+i+'\').show();">Show staff breakdown &#x25BC;</div>';
//			row+='<div class="show_hide_button_right" id="staff_kpi_table_hide_button_'+i+'" onclick="$(\'#staff_kpi_table_'+i+'\').hide();$(\'#staff_kpi_table_hide_button_'+i+'\').hide();$(\'#staff_kpi_table_show_button_'+i+'\').show();" style="display:none">Hide staff breakdown &#x25B2;</div>';

			//staff kpis
			row+='<table class="staff_kpi_table" id="staff_kpi_table_'+i+'">';
			row+='<thead><tr><th data-sort="string">Staff</th><th data-sort="int">P&R Chute</th><th data-sort="int">O Chute</th><th data-sort="int">G&G Chute</th><th data-sort="int">All Dest</th></tr></thead>';
			row+='<tbody>';
			$.each(staff_kpi[period_key],function(kpi_key,kpi_array){
				row+='<tr><td data-sort-value="'+kpi_key+'" onclick="show_staff_jobs(this,\''+period_key+'\',\''+kpi_key+'\')">'+kpi_key+'</td><td data-sort-value="0'+kpi_array['pr'].slice(0, - 1)+'">'+kpi_array['pr']+'</td><td data-sort-value=0'+kpi_array['o'].slice(0, - 1)+'>'+kpi_array['o']+'</td><td data-sort-value=0'+kpi_array['gg'].slice(0, - 1)+'>'+kpi_array['gg']+'</td><td data-sort-value=0'+kpi_array['d'].replace(/:/g,'')+'>'+kpi_array['d']+'</td></tr>';
				})
			row+='</tbody></table>';

			//job kpis
			row+='<table class="job_kpi_table" id="job_kpi_table_'+i+'">';
			row+='<thead><tr>';
					row+='<th data-sort="string">Shift</th>';
					row+='<th data-sort="int">Day</th>';
					row+='<th data-sort="int">Job</th>';
					row+='<th data-sort="int">Type</th>';
					row+='<th data-sort="int">Ass</th>';
					row+='<th data-sort="int">Res</th>';
					row+='<th data-sort="string">Location</th>';
					row+='<th></th>';
					row+='<th data-sort="string">Unit</th>';
					row+='<th data-sort="int">Chute</th>';
					row+='<th data-sort="int">AVL</th>';
					row+='<th data-sort="int">Kmh</th>';
                    row+='<th data-sort="int">Dest</th>';
					row+='<th data-sort="int">AVL</th>';
					row+='<th data-sort="string">Assign Location</th>';
			row+='</tr></thead>';
			row+='<tbody>';
			$.each(job_kpi[period_key],function(kpi_key,kpi_array){
				row+='<tr style="background-color:'+window[kpi_array['colour']]+'"">';
                    row+='<td data-sort-value="'+kpi_array['shift']+'" class="'+kpi_array['shift']+'">'+kpi_array['shift']+'</td>';
                    row+='<td data-sort-value="'+kpi_array['start_time']+'">'+kpi_array['day']+'</td>';
                    row+='<td data-sort-value="'+kpi_array['job_number']+'" class="link" onclick="load_job_info(\''+kpi_array['href'] +'\',\'kpi_page\')">'+kpi_array['job_number']+'</td>';
                    row+='<td data-sort-value="'+kpi_array['type']+'">'+kpi_array['type']+'</td>';
                    row+='<td data-sort-value="'+kpi_array['assign']+'"';if(kpi_array['assign']>40 && (kpi_array['colour']=='red1' || kpi_array['colour']=='purple')){row+='style="color:red1"';}row+='>'+s2m(kpi_array['assign'])+'</td>';
                    row+='<td data-sort-value="'+kpi_array['response']+'"';if(kpi_array['response']>480 && (kpi_array['colour']=='red1' || kpi_array['colour']=='purple')){row+='style="color:red1"';}row+='>'+s2m(kpi_array['response'])+'</td>';
                    row+='<td data-sort-value="'+kpi_array['location']+'">'+kpi_array['location']+'</td>';
                    row+='<td>&nbsp;</td>';
                    row+='<td data-sort-value="'+kpi_array['unit']+'">'+kpi_array['unit']+'</td>';
                    row+='<td data-sort-value="'+kpi_array['chute']+'"';if(kpi_array['chute']>40 && (kpi_array['colour']=='red1' || kpi_array['colour']=='purple')){row+='style="color:red1"';}row+='>'+s2m(kpi_array['chute'])+'</td>';
                    row+='<td data-sort-value="'+(parseInt(kpi_array['chute'])+parseInt(kpi_array['chute_var']))+'"';if((parseInt(kpi_array['chute'])+parseInt(kpi_array['chute_var']))>40 && (kpi_array['colour']=='red1' || kpi_array['colour']=='purple')){row+='style="color:red1"';}row+='>';if(kpi_array['chute_var']!=0){row+=s2m(parseInt(kpi_array['chute'])+parseInt(kpi_array['chute_var']))}else{row+="-";}row+='</td>';
                    row+='<td data-sort-value="'+kpi_array['speed']+'" class="link" onclick="load_avl_details(\''+kpi_array['job_number']+'\',\'kpi_page\')">';if(kpi_array['speed']==0){row+='-';}else{row+=kpi_array['speed'];}row+='</td>';
                    row+='<td data-sort-value="'+kpi_array['destination']+'"';if(kpi_array['destination']>1200){row+='style="color:red1"';}row+='>'+s2m(kpi_array['destination'])+'</td>';
                    row+='<td data-sort-value="'+(parseInt(kpi_array['destination'])+parseInt(kpi_array['dest_var']))+'"';if((parseInt(kpi_array['destination'])+parseInt(kpi_array['dest_var']))>1200){row+='style="color:red1"';}row+='>';if(kpi_array['dest_var']!=0){row+=s2m(parseInt(kpi_array['destination'])+parseInt(kpi_array['dest_var']))}else{row+="-";}row+='</td>';
                    row+='<td data-sort-value="'+kpi_array['assign_location']+'">'+kpi_array['assign_location']+'</td>';
                row+='</tr>';
				})
			row+='</tbody></table>';

			row+='</div><br/>';

			i++;
			})
		$('#kpis_data').html(row);
		var table=$('.staff_kpi_table').stupidtable();
		$('.job_kpi_table').stupidtable();
		table.bind('beforetablesort',function(event,data){$('.staff_job').remove();$('.staff_job_last').remove();});
		$('.waiting_div').hide();
		})
	}
function show_staff_jobs(object,period,staff_name){
	if($(object).parent().next().hasClass('staff_job')){$('.staff_job').remove();$('.staff_job_last').remove();}
 	else{
		$('.staff_job').remove();
		$('.staff_job_last').remove();
		var job_kpi=$.parseJSON($('staff_job_data').html());
		var row='';
		var i=1;
		if(job_kpi[period][staff_name]){
			$.each(job_kpi[period][staff_name],function(key,array){
				row+='<tr class="';
				if(job_kpi[period][staff_name].length==i){row+='staff_job_last';}
				else{row+='staff_job';}
				row+='"><td onclick="load_job_info(\''+array['href'] +'\',\'kpi_page\')" style="background-color:';
				if(array['colour']=='PURPLE'){row+=purple;}
				else if(array['colour']=='RED'){row+=red1;}
				else if(array['colour']=='ORANGE'){row+=orange1;}
				else if(array['colour']=='GREEN'){row+=green1;}
				else{row+=grey;}
				row+='">'+array['job_number']+'</td><td>';
				if(array['colour']=='PURPLE'||array['colour']=='RED'){row+=array['chute'];}
				row+='</td><td>';
				if(array['colour']=='ORANGE'){row+=array['chute'];}
				row+='</td><td>';
				if(array['colour']=='GREEN'||array['colour']=='GREY'){row+=array['chute'];}
				row+='</td><td>'+array['destination']+'</td></tr>';
				i++;
				})
			}
		$(row).insertAfter($(object).parent());
		}
	}
function load_job_info(job_id,return_page){
	//page changes & messages
	$('#job_details_close_button').removeClass($.mobile.activeBtnClass);//has been showing up as inactive sometimes
	$('#job_details_page_inner').html('');
	$.mobile.changePage($('#job_details_page'),{transition:'none',reverse:true});
	$('#job_details_close_button').attr('onclick','close_details_page(\''+return_page+'\')');//bind the close detail return_page (either return_page=vehicles_page or return_page=unit_id)
	//variables
	var dsid=window.localStorage.getItem('dsid');
	//ajax
	request=$.ajax({url:server+'/server_files/get_job_details.php',type:'POST',data:{job_id:job_id,dsid:dsid}})
	.fail(function(jqXHR,textStatus,errorThrown){if(textStatus!='abort'){show_message('Connection failed. Please reload main page and try again.','Error');close_details_page('vehicles_page');}})
	.done(function(j){
		var job_colour=$(j).find('job_colour').html();job_colour=format(job_colour);
		var job_code=$(j).find('job_code').html();job_code=job_code.substring(0,job_code.indexOf(' ')+1).toUpperCase()+' '+format(job_code.substring(job_code.indexOf(' ')+1))
		var job_number=$(j).find('job_number').html();
		var job_suburb=$(j).find('job_suburb').html();
		var job_address=$(j).find('job_address').html();
		var caller_name=$(j).find('caller_name').html();
		var caller_phone=$(j).find('caller_phone').html();
			if(caller_phone.search(/^0{1}/)==0){}// 0 at start
			else if(caller_phone.search(/^[0-9]{1}-/)==0||caller_phone.search(/^2[0-9]{1}-/)==0){caller_phone='0'+caller_phone;}// ?- or 2?- format (ie no 0 at start)
			else{caller_phone='??-'+caller_phone;}//no prefix
		var caller_type=$(j).find('caller_type').html();
		var caller_location=$(j).find('caller_location').html();

		var unit_details_array=[];
		$(j).find('unit').each(function(){
			var unit_name=$(this).find('unit_name').html();
			var unit_assigned=$(this).find('unit_assigned').html();
			var unit_enroute=$(this).find('unit_enroute').html();
			var unit_staged=$(this).find('unit_staged').html();
			var unit_located=$(this).find('unit_located').html();
			var unit_depart=$(this).find('unit_depart').html();
			var unit_arrived=$(this).find('unit_arrived').html();
			var unit_complete=$(this).find('unit_complete').html();
			unit_details_array.push(new Array(unit_name,unit_assigned,unit_enroute,unit_staged,unit_located,unit_depart,unit_arrived,unit_complete))})

		var html='<div class="job_details_title">Job Details</div>';
		html+='<table><tr><td>Job&nbsp;Colour</td><td>'+job_colour+'</td></tr><tr><td>Job&nbsp;Code</td><td>'+job_code+'</td></tr><tr><td>Job&nbsp;Number</td><td>'+job_number+'</td></tr><tr><td>Job&nbsp;Location</td><td><a class="link" target="_blank" href="maps:q='+job_address+', '+job_suburb+'">'+job_address+', '+job_suburb+'</a></td></tr><tr><td>Caller&nbsp;Name</td><td>'+caller_name+'</td></tr><tr><td>Caller&nbsp;Type</td><td>'+caller_type+'</td></tr><tr><td>Caller&nbsp;Phone</td><td><a class="link" href="tel:'+caller_phone+'">'+caller_phone+'</a></td></tr><tr><td>Caller&nbsp;Location</td><td>'+caller_location+'</td></tr></table><br/>';
		html+='<div class="job_details_title">Vehicle Details</div>';
		//responded vehicle details
		html+='<table id="vehicle_details_table"><tr><td style="text-align:left">Vehicle</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][0]+'</td>';}
		html+='</tr><tr><td style="text-align:left">Assigned</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][1]+'</td>';}
		html+='</tr><tr><td style="text-align:left">En Route</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][2]+'</td>';}
		html+='</tr><tr><td style="text-align:left">Staged</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][3]+'</td>';}
		html+='</tr><tr><td style="text-align:left">Located</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][4]+'</td>';}
		html+='</tr><tr><td style="text-align:left">Depart</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][5]+'</td>';}
		html+='</tr><tr><td style="text-align:left">Arrived</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][6]+'</td>';}
		html+='</tr><tr><td style="text-align:left">Completed</td>';for(i=0;i<unit_details_array.length;i++){html+='<td>'+unit_details_array[i][7]+'</td>';}
		html+='</tr></table><br/>';
		//job details
		html+='<div class="job_details_title">Job Notes</div>';
		html+='<table id="job_notes_table">';
		$(j).find('note').each(function(c){
			var note_time=$(this).find('note_time').html();
			var note_html=$(this).find('note_html').html();
			var background='#F5F5F5';
			if(note_html.indexOf('POL]')!='-1'){background='#c8c8ff';}
			if(note_html.indexOf('PRIVATE]')!='-1'){background='#c8c8c8';}
			if(note_html.indexOf('FIR]')!='-1'){background='#ffc8c8';}
			if(note_html.indexOf('Patients Name')!='-1'){background='#ffffc8';}
			html+='<tr><td>'+note_time+'</td><td style="background:'+background+'">'+note_html+'</td></tr>';
			})
		html+='</table><br/>';
		$('#job_details_page_inner').append(html);
		$('.waiting_div').hide();
		})
	}
function load_unit_info(unit_id){
	//page changes & messages
	$('#unit_details_close_button').removeClass($.mobile.activeBtnClass);//has been showing up as inactive sometimes
	$('#unit_details_page_inner').html('');
	$.mobile.changePage($('#unit_details_page'),{transition:'none',reverse:true});
	//variables
	var dsid=window.localStorage.getItem('dsid');
	//ajax
	request=$.ajax({url:server+'/server_files/get_unit_details.php',type:'POST',data:{unit_id:unit_id,dsid:dsid}})
	.fail(function(jqXHR,textStatus,errorThrown){if(textStatus!='abort'){show_message('Connection failed. Please reload main page and try again.','Error');close_details_page('vehicles_page');}})
	.done(function(u){
		var html='';
		var unit_name=$(u).find('unit_name').html();
		var unit_number=$(u).find('unit_number').html();
		var unit_qual=$(u).find('unit_qual').html();
		html+='<div class="unit_details_title">Unit Details</div>';
		html+='<table><tr><td>Unit Name</td><td>'+unit_name+'</td></tr><tr><td>Unit Number</td><td>'+unit_number+'</td></tr><tr><td>Unit Qual</td><td>'+unit_qual+'</td></tr></table><br/>';
		html+='<div class="unit_details_title">Staff Details</div>';
		html+='<table class="unit_details_table"><tr><td>Staff</td><td>Start</td><td>Shift</td></tr>';
		$(u).find('staff').each(function(){
			var staff_name=$(this).find('staff_name').html();
			var staff_start=$(this).find('staff_start').html();
			var staff_shift=$(this).find('staff_shift').html();
			html+='<tr><td>'+staff_name+'</td><td>'+staff_start+'</td><td>'+staff_shift+'</td></tr>';
			})
		html+='</table><br/>';
		if($(u).find('job_start_time').length>0||$(u).find('activity').length>0){//if records kept on vehicle
			//unit completed jobs
			html+='<div class="unit_details_title">Completed Jobs</div>';
			html+='<table class="unit_details_table"><tr><td>Time</td><td>Job</td><td>Type</td><td>Location</td><td>Chute</td><td>AVL</td><td>Destination</td><td>AVL</td><td>Speed</td><td>Assign Location</td></tr>';
			$(u).find('job').each(function(){
				var job_start_time=$(this).find('job_start_time').html();
				var job_number=$(this).find('job_number').html();
				var job_priority=$(this).find('job_priority').html();
				var job_type=$(this).find('job_type').html();
				var job_location=$(this).find('job_location').html();
				var job_href=$(this).find('job_href').html();
				var job_assign_location=$(this).find('job_assign_location').html();
				var job_chute=$(this).find('job_chute').html();
				var job_chute_var=$(this).find('job_chute_var').html();
				var job_destination=$(this).find('job_destination').html();
				var job_destination_var=$(this).find('job_destination_var').html();
				var job_top_speed=$(this).find('job_top_speed').html();
				html+='<tr style="background:';
				if(job_priority=='PURPLE'){html+=purple}
				else if(job_priority=='RED'){html+=red1}
				else if(job_priority=='ORANGE'){html+=orange1}
				else if(job_priority=='GREEN'){html+=green1}
				else if(job_priority=='PTS'){html+=grey}
				else{html+=white}
				html+='"><td>'+job_start_time+'</td><td class="link" onclick="load_job_info(\''+job_href +'\',\''+unit_id+'\')">'+job_number+'</td><td>'+job_type+'</td><td>'+job_location+'</td><td>'+s2m(job_chute)+'</td>';
				html+='<td>';if(job_chute_var>0){html+='+';}html+=s2m(job_chute_var)+'</td>';
				html+='<td>'+s2m(job_destination)+'</td>';
				html+='<td>';if(job_destination_var>0){html+='+';}html+=s2m(job_destination_var)+'</td>';
				html+='<td class="link" onclick="load_avl_details(\''+job_number+'\',\'unit_details_page\')">';if(job_top_speed==0){html+='-';}else{html+=job_top_speed;}html+='</td>';
				html+='<td>'+job_assign_location+'</td></tr>';
				})
			html+='</table><br/>';
			//unit activity
			html+='<div class="unit_details_title">Unit Activity</div>';
			html+='<table class="unit_details_table"><tr><td>Time</td><td>Activity</td><td>Comment</td></tr>';
			$(u).find('event').each(function(){
				var time=$(this).find('time').html();
				var activity=$(this).find('activity').html();
				var comment=$(this).find('comment').html();
				var background='#F5F5F5';
				if(activity.indexOf('16 - Out Of Service')!='-1'&&comment.indexOf('Break')!='-1'){background='yellow';}
				if(activity.indexOf('01 - Dispatched')!='-1'){background=grey;}
				if(activity.indexOf('11 - Available')!='-1'){background=grey;}
				if(activity.indexOf('15 - In Quarters')!='-1'){background=grey;}
				html+='<tr><td style="background:'+background+'">'+time+'</td><td style="background:'+background+'">'+activity+'</td><td>'+comment+'</td></tr>';
				})
			html+='</table>';}
		$('#unit_details_page_inner').append(html);
		$('.waiting_div').hide();
		})
	}
function load_avl_details(job_id,return_page){
	$('.waiting_div').show();
	$.mobile.changePage('#avl_page');
	$('#avl_details_close_button').attr('onclick','close_avl_page(\''+return_page+'\')');//bind the close detail return_page (either return_page=vehicles_page or return_page=unit_id)

	//variables
	var url=server+'/server_files/get_avl_details.php';
	var app_username=window.localStorage.getItem('app_username');
	var app_password=window.localStorage.getItem('app_password');
	var dsid=window.localStorage.getItem('dsid');

	//ajax
	request=$.ajax({url:url,type:'POST',data:{app_username:app_username,app_password:app_password,dsid:dsid,job_id:job_id}})
	.fail(function(jqXHR,textStatus,errorThrown){})
	.done(function(u){
		var row='';
		row+='<table class="avl_table">';
		var avl_data=$.parseJSON(u);
		$.each(avl_data,function(vehicle,vehicle_array){
			row+='<tr><td colspan="4"><div class="kpi_title">'+vehicle+'</div></td></tr>';
			row+='<th>Time</th><th>Activity</th><th>Comment</th><th>Location</th>';
			$.each(vehicle_array,function(avl_key,avl_array){
				row+='<tr><td>'+avl_array[0]+'</td><td>'+avl_array[1]+'</td><td>'+avl_array[2]+'</td><td>'+avl_array[3]+'</td></tr>';
				})

			})
		row+='</table>';
		$('#avl_data').html(row);
		$('.waiting_div').hide();
		})
	}
function close_details_page(return_page){
	request.abort();
	$('.waiting_div').hide();
	if(return_page=='vehicles_page'){$.mobile.changePage($('#vehicles_page'),{transition:'none',reverse:false});}
	else if(return_page=='kpi_page'){$.mobile.changePage($('#kpi_page'),{transition:'none',reverse:false});}
	else{$.mobile.changePage($('#unit_details_page'),{transition:'none',reverse:false});}
	}
function close_avl_page(return_page){
	request.abort();
	$('.waiting_div').hide();
	if(return_page=='kpi_page'){$.mobile.changePage($('#kpi_page'),{transition:'none',reverse:false});}
	else{$.mobile.changePage($('#unit_details_page'),{transition:'none',reverse:false});}
	}

//settings functions
function open_settings(){
	//page change
	$.mobile.changePage($('#settings_page'),{transition:'none'});
	//get arrays from localstorage
	if(window.localStorage.getItem('eas_inclusions_array')==''){var eas_inclusions_array=[];}else{var eas_inclusions_array=window.localStorage.getItem('eas_inclusions_array').split(',');}
	if(window.localStorage.getItem('oos_exclusions_array')==''){var oos_exclusions_array=[];}else{var oos_exclusions_array=window.localStorage.getItem('oos_exclusions_array').split(',');}
	if(window.localStorage.getItem('permanent_exclusions_array')==''){var permanent_exclusions_array=[];}else{var permanent_exclusions_array=window.localStorage.getItem('permanent_exclusions_array').split(',');}
	if(window.localStorage.getItem('vehicle_abbreviations_array')==''){var vehicle_abbreviations_array=[];}else{var vehicle_abbreviations_array=split2Darray(window.localStorage.getItem('vehicle_abbreviations_array'));}
	if(window.localStorage.getItem('location_abbreviations_array')==''){var location_abbreviations_array=[];}else{var location_abbreviations_array=split2Darray(window.localStorage.getItem('location_abbreviations_array'));}
	//empty
	$('#eas_inclusions_list').html('');
	$('#oos_exclusions_list').html('');
	$('#permanent_exclusions_list').html('');
	$('#vehicle_abbreviations_table').html('');
	$('#location_abbreviations_table').html('');
	//fill
	$(eas_inclusions_array).each(function(x){$('#eas_inclusions_list').append('<input type="text" placeholder="Enter EAS Inclusion" value="'+eas_inclusions_array[x]+'"/>')})
	$(oos_exclusions_array).each(function(x){$('#oos_exclusions_list').append('<input type="text" placeholder="Enter OOS Exclusion" value="'+oos_exclusions_array[x]+'"/>')})
	$(permanent_exclusions_array).each(function(x){$('#permanent_exclusions_list').append('<input type="text" placeholder="Enter Exclusion" value="'+permanent_exclusions_array[x]+'"/>')});
	$(vehicle_abbreviations_array).each(function(x){$('#vehicle_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value="'+vehicle_abbreviations_array[x][0]+'"/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value="'+vehicle_abbreviations_array[x][1]+'"/></td></tr>')})
	$(location_abbreviations_array).each(function(x){$('#location_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value="'+location_abbreviations_array[x][0]+'"/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value="'+location_abbreviations_array[x][1]+'"/></td></tr>')	})
	//add empty input at bottom of each list
	$('#eas_inclusions_list').append('<input type="text" placeholder="Enter EAS Inclusion" value=""/>')
	$('#oos_exclusions_list').append('<input type="text" placeholder="Enter OOS Exclusion" value=""/>')
	$('#permanent_exclusions_list').append('<input type="text" placeholder="Enter Exclusion" value=""/>')
	$('#vehicle_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value=""/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value=""/></td></tr>')
	$('#location_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value=""/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value=""/></td></tr>')
	//bind
	$('#eas_inclusions_list input').bind('keyup',  function(){eas_inclusions_input_keyup(this);});
	$('#eas_inclusions_list input').bind('change', function(){eas_inclusions_input_change(this);});
	$('#oos_exclusions_list input').bind('keyup',  function(){oos_exclusions_input_keyup(this);});
	$('#oos_exclusions_list input').bind('change', function(){oos_exclusions_input_change(this);});
	$('#permanent_exclusions_list input').bind('keyup',  function(){permanent_exclusions_input_keyup(this);});
	$('#permanent_exclusions_list input').bind('change', function(){permanent_exclusions_input_change(this);});
	$('#vehicle_abbreviations_table input').bind('keyup',  function(){vehicle_abbreviation_input_keyup(this);});
	$('#vehicle_abbreviations_table input').bind('change', function(){vehicle_abbreviation_input_change(this);});
	$('#location_abbreviations_table input').bind('keyup',  function(){location_abbreviation_input_keyup(this);});
	$('#location_abbreviations_table input').bind('change', function(){location_abbreviation_input_change(this);});
	//render
	$('#eas_inclusions_list').trigger('create');
	$('#oos_exclusions_list').trigger('create');
	$('#permanent_exclusions_list').trigger('create');
	$('#vehicle_abbreviations_table').trigger('create');
	$('#location_abbreviations_table').trigger('create');
	}
function close_settings(){
	//page change
	$.mobile.changePage($('#vehicles_page'),{transition:'none',reverse:true});
	//variables
	var eas_inclusions_array=[];
	var oos_exclusions_array=[];
	var permanent_exclusions_array=[];
	var vehicle_abbreviations_array=[];
	var location_abbreviations_array=[];
	//build arrays
	$('#eas_inclusions_list input').each(function(x){if($('#eas_inclusions_list input').eq(x).val()!=''){eas_inclusions_array.push($('#eas_inclusions_list input').eq(x).val());}})
	$('#oos_exclusions_list input').each(function(x){if($('#oos_exclusions_list input').eq(x).val()!=''){oos_exclusions_array.push($('#oos_exclusions_list input').eq(x).val());}})
	$('#permanent_exclusions_list input').each(function(x){if($('#permanent_exclusions_list input').eq(x).val()!=''){permanent_exclusions_array.push($('#permanent_exclusions_list input').eq(x).val());}})
	$('#vehicle_abbreviations_table tr').each(function(x){if($(this).find('input').eq(0).val()!=''){vehicle_abbreviations_array.push([$(this).find('input').eq(0).val(),$(this).find('input').eq(1).val()]);}})
	$('#location_abbreviations_table tr').each(function(x){if($(this).find('input').eq(0).val()!=''){location_abbreviations_array.push([$(this).find('input').eq(0).val(),$(this).find('input').eq(1).val()]);}})
	//set storage
	window.localStorage.setItem('eas_inclusions_array',eas_inclusions_array.toString());
	window.localStorage.setItem('oos_exclusions_array',oos_exclusions_array.toString());
	window.localStorage.setItem('permanent_exclusions_array',permanent_exclusions_array.toString());
	window.localStorage.setItem('vehicle_abbreviations_array',join2Darray(vehicle_abbreviations_array));
	window.localStorage.setItem('location_abbreviations_array',join2Darray(location_abbreviations_array));
	}
function reset_defaults(list){
	var confirmed;
	if(list!='all'){
		if(confirm('Are you sure you want to reset these defaults? This will permanently delete all changed you have made.')){
			confirmed=1;}}
	if(confirmed==1||list=='all'){
		if(list=='vehicle_abbreviations_table'||list=='all'){
			$('#vehicle_abbreviations_table').html('');
			$(default_vehicle_abbreviations_array).each(function(x){$('#vehicle_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value="'+default_vehicle_abbreviations_array[x][0]+'"/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value="'+default_vehicle_abbreviations_array[x][1]+'"/></td></tr>')})
			$('#vehicle_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value=""/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value=""/></td></tr>')
			$('#vehicle_abbreviations_table').trigger('create');
			$('#vehicle_abbreviations_table input').bind('change',function(){vehicle_abbreviation_input_change(this);});
			$('#vehicle_abbreviations_table input').bind('keyup',function(){vehicle_abbreviation_input_keyup(this);});}
		if(list=='location_abbreviations_table'||list=='all'){
			$('#location_abbreviations_table').html('');
			$(default_location_abbreviations_array).each(function(x){$('#location_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value="'+default_location_abbreviations_array[x][0]+'"/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value="'+default_location_abbreviations_array[x][1]+'"/></td></tr>')})
			$('#location_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original" value=""/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation" value=""/></td></tr>')
			$('#location_abbreviations_table').trigger('create');
			$('#location_abbreviations_table input').bind('change',function(){location_abbreviation_input_change(this);});
			$('#location_abbreviations_table input').bind('keyup',function(){location_abbreviation_input_keyup(this);});}
		if(list=='permanent_exclusions_list'||list=='all'){
			$('#permanent_exclusions_list').html('');
			for(x=0;x<default_permanent_exclusions_array.length;x++){$('#permanent_exclusions_list').append('<input type="text" placeholder="Enter Exclusion" value="'+default_permanent_exclusions_array[x]+'"/>')}
			$('#permanent_exclusions_list').append('<input type="text" placeholder="Enter Exclusion" value=""/>')
			$('#permanent_exclusions_list').trigger('create');
			$('#permanent_exclusions_list input').bind('change',function(){permanent_exclusions_input_change(this);});
			$('#permanent_exclusions_list input').bind('keyup',function(){permanent_exclusions_input_keyup(this);});}
		if(list=='eas_inclusions_list'||list=='all'){
			$('#eas_inclusions_list').html('');
			for(x=0;x<default_eas_inclusions_array.length;x++){$('#eas_inclusions_list').append('<input type="text" placeholder="Enter EAS Inclusion" value="'+default_eas_inclusions_array[x]+'"/>')}
			$('#eas_inclusions_list').append('<input type="text" placeholder="Enter EAS Inclusion" value=""/>')
			$('#eas_inclusions_list').trigger('create');
			$('#eas_inclusions_list input').bind('change',function(){eas_inclusions_input_change(this);});
			$('#eas_inclusions_list input').bind('keyup',function(){eas_inclusions_input_keyup(this);});}
		if(list=='oos_exclusions_list'||list=='all'){
			$('#oos_exclusions_list').html('');
			for(x=0;x<default_oos_exclusions_array.length;x++){$('#oos_exclusions_list').append('<input type="text" placeholder="Enter OOS Exclusion" value="'+default_oos_exclusions_array[x]+'"/>')}
			$('#oos_exclusions_list').append('<input type="text" placeholder="Enter OOS Exclusion" value=""/>')
			$('#oos_exclusions_list').trigger('create');
			$('#oos_exclusions_list input').bind('change',function(){oos_exclusions_input_change(this);});
			$('#oos_exclusions_list input').bind('keyup',function(){oos_exclusions_input_keyup(this);});}
		}
	}
function vehicle_abbreviation_input_keyup(x){
	//create new input at end
	var num_inputs=$('#vehicle_abbreviations_table input').length;
	if($('#vehicle_abbreviations_table input').eq(num_inputs-2).val()!=''||$('#vehicle_abbreviations_table input').eq(num_inputs-1).val()!=''){
		$('#vehicle_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original"/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation"/></td></tr>').trigger('create');
		$('#vehicle_abbreviations_table input').eq(num_inputs).bind('change',function(){vehicle_abbreviation_input_change(this);});
		$('#vehicle_abbreviations_table input').eq(num_inputs).bind('keyup',function(){vehicle_abbreviation_input_keyup(this);});
		$('#vehicle_abbreviations_table input').eq(num_inputs+1).bind('change',function(){vehicle_abbreviation_input_change(this);});
		$('#vehicle_abbreviations_table input').eq(num_inputs+1).bind('keyup',function(){vehicle_abbreviation_input_keyup(this);});
		}
	}
function vehicle_abbreviation_input_change(x){
	//delete unused inputs
	var this_input=$('#vehicle_abbreviations_table input').index(x);
	if(this_input%2==0){
		if($('#vehicle_abbreviations_table input').eq(this_input).val()==''&&$('#vehicle_abbreviations_table input').eq(this_input+1).val()==''){
			$('#vehicle_abbreviations_table input').eq(this_input).parent().parent().remove();
			}
		}
	else{
		if($('#vehicle_abbreviations_table input').eq(this_input-1).val()==''&&$('#vehicle_abbreviations_table input').eq(this_input).val()==''){
			$('#vehicle_abbreviations_table input').eq(this_input).parent().parent().remove();
			}
		}
	}
function location_abbreviation_input_keyup(x){
	//create new input at end
	var num_inputs=$('#location_abbreviations_table input').length;
	if($('#location_abbreviations_table input').eq(num_inputs-2).val()!=''||$('#location_abbreviations_table input').eq(num_inputs-1).val()!=''){
		$('#location_abbreviations_table').append('<tr><td><input type="text" data-mini="true" placeholder="Original"/></td><td>&gt;</td><td><input type="text" data-mini="true" placeholder="Abbreviation"/></td></tr>').trigger('create');
		$('#location_abbreviations_table input').eq(num_inputs).bind('change',function(){location_abbreviation_input_change(this);});
		$('#location_abbreviations_table input').eq(num_inputs).bind('keyup',function(){location_abbreviation_input_keyup(this);});
		$('#location_abbreviations_table input').eq(num_inputs+1).bind('change',function(){location_abbreviation_input_change(this);});
		$('#location_abbreviations_table input').eq(num_inputs+1).bind('keyup',function(){location_abbreviation_input_keyup(this);});
		}
	}
function location_abbreviation_input_change(x){
	//delete unused inputs
	var this_input=$('#location_abbreviations_table input').index(x);
	if(this_input%2==0){
		if($('#location_abbreviations_table input').eq(this_input).val()==''&&$('#location_abbreviations_table input').eq(this_input+1).val()==''){
			$('#location_abbreviations_table input').eq(this_input).parent().parent().remove();
			}
		}
	else{
		if($('#location_abbreviations_table input').eq(this_input-1).val()==''&&$('#location_abbreviations_table input').eq(this_input).val()==''){
			$('#location_abbreviations_table input').eq(this_input).parent().parent().remove();
			}
		}
	}
function permanent_exclusions_input_keyup(x){
	//create new input at end
	if($('#permanent_exclusions_list input').eq($('#permanent_exclusions_list input').length-1).val()!=''){
		$('#permanent_exclusions_list').append('<input type="text" placeholder="Enter Exclusion"/>').trigger('create');
		$('#permanent_exclusions_list input').eq($('#permanent_exclusions_list input').length-1).bind('change',function(){permanent_exclusions_input_change(this);});
		$('#permanent_exclusions_list input').eq($('#permanent_exclusions_list input').length-1).bind('keyup',function(){permanent_exclusions_input_keyup(this);});
		}
	}
function permanent_exclusions_input_change(x){
	//delete unused inputs
	if($('#permanent_exclusions_list input').eq($('#permanent_exclusions_list input').index(x)).val()==''){
		$('#permanent_exclusions_list input').eq($('#permanent_exclusions_list input').index(x)).remove();
		}
	}
function eas_inclusions_input_keyup(x){
	//create new input at end
	if($('#eas_inclusions_list input').eq($('#eas_inclusions_list input').length-1).val()!=''){
		$('#eas_inclusions_list').append('<input type="text" placeholder="Enter EAS Inclusion"/>').trigger('create');
		$('#eas_inclusions_list input').eq($('#eas_inclusions_list input').length-1).bind('change',function(){eas_inclusions_input_change(this);});
		$('#eas_inclusions_list input').eq($('#eas_inclusions_list input').length-1).bind('keyup',function(){eas_inclusions_input_keyup(this);});
		}
	}
function eas_inclusions_input_change(x){
	//delete unused inputs
	if($('#eas_inclusions_list input').eq($('#eas_inclusions_list input').index(x)).val()==''){
		$('#eas_inclusions_list input').eq($('#eas_inclusions_list input').index(x)).remove();
		}
	}
function oos_exclusions_input_keyup(x){
	//create new input at end
	if($('#oos_exclusions_list input').eq($('#oos_exclusions_list input').length-1).val()!=''){
		$('#oos_exclusions_list').append('<input type="text" placeholder="Enter OOS Exclusion"/>').trigger('create');
		$('#oos_exclusions_list input').eq($('#oos_exclusions_list input').length-1).bind('change',function(){oos_exclusions_input_change(this);});
		$('#oos_exclusions_list input').eq($('#oos_exclusions_list input').length-1).bind('keyup',function(){oos_exclusions_input_keyup(this);});
		}
	}
function oos_exclusions_input_change(x){
	//delete unused inputs
	var this_input_num=$('#oos_exclusions_list input').index(x);
	if($('#oos_exclusions_list input').eq(this_input_num).val()==''){
		$('#oos_exclusions_list input').eq(this_input_num).remove();
		}
	}

//misc functions
function add_flag_to_unit(vehicle,cell){
	//get from local storage
	if(window.localStorage.getItem('flagged_blue_units_array')==null){var flagged_blue_units_array=[];}else{var flagged_blue_units_array=window.localStorage.getItem('flagged_blue_units_array').split(',');}
	//process
	if($(cell).hasClass('flagged_blue')){$(cell).removeClass('flagged_blue');flagged_blue_units_array.splice(flagged_blue_units_array.indexOf(vehicle),1);}
	else{$(cell).addClass('flagged_blue');flagged_blue_units_array.push(vehicle);}
	//store in local storage
	window.localStorage.setItem('flagged_blue_units_array',flagged_blue_units_array.toString());
	}
function hide_kpis(){
	$('#top_bar').hide();$('#vehicle_div').css('padding-top','0px');
	}
function show_kpis(){
	$('#top_bar').show();$('#vehicle_div').css('padding-top','31px');
	}
function show_message(message,title){
	if(in_app==1){navigator.notification.alert(message,callback,title);}else{alert(message);}
	}
function join2Darray(arr){
	for(var i=0;i<arr.length;i++){if(arr[i].join)arr[i]=arr[i].join(':');}
	return arr.join(',');
	}
function split2Darray(str){
	var arr=str.split(',');
	for(var i=0;i<arr.length;i++)arr[i]=arr[i].split(':');
	return arr;
	}
function format(string){
	if(string){
		string=string.replace(/&Amp;/gi,'&');
		string=string.replace(/\w\S*/g,function(txt){return txt.charAt(0).toUpperCase()+txt.substr(1).toLowerCase();});//uppercase word
		string=string.replace(/\\\w*/g,function(txt){return '\\'+txt.charAt(1).toUpperCase()+txt.substr(2).toLowerCase();});//uppercase after '\'
		string=string.replace(/\-\w*/g,function(txt){return '\\'+txt.charAt(1).toUpperCase()+txt.substr(2).toLowerCase();});//uppercase after '-'
		var location_abbreviations_array=split2Darray(window.localStorage.getItem('location_abbreviations_array'));
		$(location_abbreviations_array).each(function(x){string=string.replace(location_abbreviations_array[x][0],location_abbreviations_array[x][1])})
		}
	return string;
	}
function s2m(input){
	h=Math.floor(input / 60 / 60) % 24;
    m=Math.floor(input / 60) % 60;
    s=input % 60;
    if(input==0){time='-';}
	else{
    	if(input>3599){
			if(s<10){s='0'+s;}
			if(m<10){m='0'+m;}
    		time=h+':'+m+':'+s;
    		}
    	else if(input>59){
    		if(s<10){s='0'+s;}
    		time=m+':'+s;}
    	else{time=s+'s';}
    	}
	return time;
   	}
function callback(){}//for alert messages