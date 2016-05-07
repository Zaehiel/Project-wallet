(function(){
   "use strict";
	
	function _(input){
		return document.querySelector(input);
	}
   var Auth = function(){
	   if(Auth.instance){
		   return Auth.instance;
	   }
	   console.log('auth töös');
	   Auth.instance = this;
	   
	   //CACHE
       this.cache = window.applicationCache;
       this.startCacheListeners();

	   
	   this.data = [];
	   this.spent = 0;
	   
	   this.initialize();
   };
   
   window.Auth = Auth;
   
	Auth.prototype = {
		initialize: function(){
			console.log('initialized');
			this.bindEvents();
			if(this.checkAuth() === 'noUsername'){
				_('#disclaimer').className = _('#disclaimer').className.replace('disNone', 'disBlo');
				_('#create').className = _('#create').className.replace('disNone', 'disBlo');

			
			} else if(this.checkAuth() === 'noBudget') {
				_('#disclaimer').className = _('#disclaimer').className.replace('disBlo', 'disNone');
				_('#create').className = _('#create').className.replace('disBlo', 'disNone');
				
				_('#budgetInit').className = _('#budgetInit').className.replace('disNone', 'disBlo');
			
			} else if(this.checkAuth() === 'both'){
				_('#budgetInit').className = _('#budgetInit').className.replace('disBlo', 'disNone');
				
				_('#budget').className = _('#budget').className.replace('disNone', 'disBlo');
				this.progressBar();
				if(localStorage.data){
					this.calculate();
					this.drawHistory();
				}
			}
		},
		checkAuth: function(){
			console.log("checkAuth töös");
			if(!localStorage.userName){
				return 'noUsername';
			} else if(localStorage.userName && !localStorage.budgetAmount){
				return 'noBudget';
			} else if(localStorage.userName && localStorage.budgetAmount){
				return 'both';
			} 
		},
		initAuth: function(){
			var profilename = _('#profileName').value;
			if(profilename.length > 2){
				console.log(profilename);
				this.checkUser(profilename);
				localStorage.setItem('userName', profilename);
				this.initialize();
			} else {
				/*show error*/
			}
		},
		setBudget: function(){
			var budget = _('#budgetAmount').value;
			if(budget > 0){
				console.log(budget);
				localStorage.setItem('budgetAmount', budget);
				this.initialize();
				this.progressBar();
				_('#currentBudget').value = budget;
			} else {
				/*show error*/
			}
		},
		editBudget: function(){
			var newB = _('#currentBudget').value;
			if(newB === localStorage.budgetAmount){
				/*do nothing*/
			} else if( newB > 0 ){
				localStorage.budgetAmount = newB;
				this.progressBar();
			}
		},
		progressBar: function(){
			
			if(this.spent != 0){
				var total = parseInt(localStorage.budgetAmount);
				var diff = total - parseFloat(this.spent);
				var percentage = parseInt(( diff / total ) * 100);
				if(percentage < 0){
					percentage = 0;
				}
				_('#progressbar').style.width = percentage+'%';
				console.log(percentage+'%');
				_('#budgetStatus').innerHTML = diff.toFixed(2)+' €';
			} else {
				_('#progressbar').style.width = '100%'
				_('#budgetStatus').innerHTML = localStorage.budgetAmount+' €';
				console.log('set max width bar');
			}
			if(localStorage.budgetAmount){_('#currentBudget').value = localStorage.budgetAmount}
		},
		checkUser: function(profilename){
			/**/
		},
		addItem: function(){
			var title = _('#expenseName').value;
			var amount = _('#amount').value;
			
			if(localStorage.data){
				console.log(localStorage.data);
				if(this.data.length < 1){
					var array = JSON.parse(localStorage.data);
					array.forEach(function(data){
						var load = new Data(data.title, data.amount, data.date);
						Auth.instance.data.push(load);
					});
					
				}
				if(title.length > 0 && amount > 0){
					_('#expenseName').parentNode.className = _('#expenseName').parentNode.className.replace('has-warning', '');
					_('#amount').parentNode.className = _('#amount').parentNode.className.replace('has-warning', '');
					var new_entry = new Data(title, amount);
					this.data.push(new_entry);
					localStorage.setItem('data', JSON.stringify(this.data) );
					this.calculate();
					_('#expenseName').value = '';
					_('#amount').value = '';
					this.drawHistory();
				} else if(title.length < 1){
					_('#expenseName').parentNode.className = _('#expenseName').parentNode.className+' has-warning';
				} else if(amount < 1){
					_('#amount').parentNode.className = _('#amount').parentNode.className+' has-warning';
				}
			} else {
				if(title.length > 0 && amount > 0){
					_('#expenseName').parentNode.className = _('#expenseName').parentNode.className.replace('has-warning', '');
					_('#amount').parentNode.className = _('#amount').parentNode.className.replace('has-warning', '');
					var new_entry = new Data(title, amount);
					console.log(new_entry);
					this.data.push(new_entry);
					localStorage.setItem('data', JSON.stringify(this.data) );
					this.calculate();
					_('#expenseName').value = '';
					_('#amount').value = '';
					this.drawHistory();
				} else if(title.length < 1){
					_('#expenseName').parentNode.className = _('#expenseName').parentNode.className+' has-warning';
				} else if(amount < 1){
					_('#amount').parentNode.className = _('#amount').parentNode.className+' has-warning';
				}
				
			}
			
		},
		calculate: function(){
			if(localStorage.data){
				var obj = JSON.parse(localStorage.data);
				Auth.instance.spent = 0;
				obj.forEach(function(value){
					Auth.instance.spent += 1.0*value.amount;
					console.log(Auth.instance.spent);
				});
				
			}
			this.progressBar();
		},
		drawHistory: function(){
			_('.list-of-jars').innerHTML = '';
			var cache = JSON.parse(localStorage.data);
			var counter = 0;
			var that = this;
			cache.forEach(function(item){
				var li = document.createElement('li');
				li.setAttribute("id", counter);

				var span = document.createElement('p');
				span.className = 'title';
				span.innerHTML = item.title;
				
				var span2 = document.createElement('span');
				span2.className = 'amount';
				span2.innerHTML = item.amount+' €';
				
				var span3 = document.createElement('span');
				span3.className = 'date';
				span3.innerHTML = item.date;
				
				var br = document.createElement('br');
				
				var btn = document.createElement('button');
				btn.className = 'btn btn-default del-btn';
				btn.setAttribute('onclick', 'javascript:Auth.instance.deleteItem('+counter+');');
				btn.innerHTML = '<i class="fa fa-minus-circle" aria-hidden="true"></i>';
				

				//btn.addEventListener('click', that.deleteItem.bind(that));
				//only works on  pc chrome... f you ff and f you safari get updated zzzz
				li.appendChild(span);
				li.appendChild(span3);
				li.appendChild(span2);
				
				li.appendChild(btn);
				_('.list-of-jars').appendChild(li);
				counter++;
			});

		},
		deleteItem: function(id){
			/*kasutan ID, et aru saada millisele objektile klikati*/
			/*vaatan kas kohalik this.data[] massiiv sisaldab midagi,
			kui ei, siis loen localist data ja parsin massiiviks*/
			if(Auth.instance.data < 1){
				console.log('init delete action: '+ Auth.instance.data);
				
				var array2 = JSON.parse(localStorage.data);
					array2.forEach(function(data2){
						var load2 = new Data(data2.title, data2.amount, data2.date);
						Auth.instance.data.push(load2);
					});
	
				console.log('end delete action: '+Auth.instance.data);
			}
			
			/*kindlustan, et saan inti*/
			var index = parseInt(id);
			/*nuppudel on ID vastav id, mis ma genereerisin drawHistory sees*/
			var elem = document.getElementById(index);
			/*btnist lähen parentNode > li ja kustuan li*/
			elem.parentNode.removeChild(elem);
			//console.log(index);
			//console.log(this.data);
			/*eemaldan kohal index olevad andmed*/
			this.data.splice(index, 1);
			//console.log(this.data);
			/*laen uuendatud massiivi uuesti localStorageisse*/
			localStorage.data = JSON.stringify(this.data);
			/*renderin kogu listi uuesti, et saada uued ID'd, muidu asi breakib ja ei kustuta õigeid asju*/
			this.drawHistory();
			this.calculate();
		},
		bindEvents: function(){
			console.log('bind launched');
			_('#initialize').addEventListener('click', this.initAuth.bind(this));
			_('#setBudget').addEventListener('click', this.setBudget.bind(this));
			
			_('#submit').addEventListener('click', this.addItem.bind(this));
			
			_('#editBudget').addEventListener('click', this.editBudget.bind(this));
		 },
		 
		 startCacheListeners: function(){
            window.applicationCache.addEventListener('updateready',function(){
                window.applicationCache.swapCache();
                console.log('swap cache has been called');
            },false);

            setInterval(function(){
                Auth.instance.cache.update();
                //kontrollib cache'i iga 10s tagant
            }, 10000);
        }
	   
	   
	};
	
	
	
	function rei(input){
		if(input < 10){
			input = '0'+input;
		}
		return input;
	}
	var Data = function(title, amount, date){
		if(date != null){
			this.title = title;
			this.amount = amount;
			this.date = date;
		} else {
		   var time = new Date();
		   var hr = rei(time.getHours());
		   var min = rei(time.getMinutes());
		   var sec = rei(time.getSeconds());
		   var month = rei(time.getMonth()+1);
		   var date = rei(time.getDate());
		   
		   this.title = title;
		   this.amount = amount;
		   this.date = hr+':'+min+'.'+sec+' '+date+'/'+month;
		}
   }
 
   
   

   

   // kui leht laetud kĆ¤ivitan Moosipurgi rakenduse
   window.onload = function(){
     var load = new Auth();
	 //var app = new Moosipurk();
	
   };

})();
