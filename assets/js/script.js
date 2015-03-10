
var inputEls = document.getElementById("all-profiles").getElementsByTagName("input");
var filters = {};

ready(function(){
		
	// Interesting: If you do a for loop, you get into scope problems
	iterateCollection(inputEls)(function(inputEl, i){
		if(inputEl.type == "checkbox"){
			inputEl.addEventListener("click", function(){
				var specName = inputEl.getAttribute("name");
				if(inputEl.checked === true){
					// If the filter for this specification isn't created yet - do it. 
					if(!(filters[specName] && filters[specName].length)){
						filters[specName] = []; 
					}
					filters[specName].push(inputEl.value);
					console.log("ticked", filters);
					
					createQueryHash(filters);
				}
				if(inputEl.checked === false){
					if(filters[specName] && filters[specName].length && (filters[specName].indexOf(inputEl.value) != -1)){
						var index = filters[specName].indexOf(inputEl.value);
						filters[specName].splice(index,1);
						if(!filters[specName].length){
							delete filters[specName];
						};
					}
					createQueryHash(filters);
				}
			})
		}
	})


	document.getElementById("filters").addEventListener("click", function(e){
		e.preventDefault();
		window.location.hash = '#';
	});


	var singleprofilePage = document.getElementById("single-profile");

	singleprofilePage.addEventListener("click", function(e) {

		 if (hasClass(singleprofilePage, "visible")) {

			var clicked = e.target;

			// If the close button or the background are clicked go to the previous page.
			if (hasClass(clicked, "close") || hasClass(clicked, "overlay")) {
				// Change the url hash with the last used filters.
				createQueryHash(filters);
			}

		} 

	});
});    // end ready





function uncheck(checkboxes){
	iterateCollection(checkboxes)(function(inputEl, i){
		if(inputEl.type == "checkbox"){
			inputEl.checked = false;
		}
	});
}


getJSON('profiles.json', function(data){
	profiles = data;

	buildprofileList(profiles);

});


// On Hashchange new render
window.addEventListener("hashchange", function(){
	render(window.location.hash);
});



function render(url){
	var temp = url.split('/')[0];

    var pages = document.getElementById('main-content').getElementsByClassName('page');
    iterateCollection(pages)(function(page, i){
    	removeClass(page,'visible');
    }); 

    var	map = {

			// The "Homepage".
			'': function() {
              
				// Clear the filters object, uncheck all checkboxes, show all the profiles
				filters = {};
				var inputEls = document.getElementById("all-profiles").getElementsByTagName("input");
				uncheck(inputEls);

				renderprofilesPage(profiles);
			},

			// Single profiles page.
			'#profile': function() {

				// Get the index of which profile we want to show and call the appropriate function.
				var index = url.split('#profile/')[1].trim();

				renderSingleprofilePage(index, profiles);
			},

			// Page with filtered profiles
			'#filter': function() {

				// Grab the string after the '#filter/' keyword. Call the filtering function.
				url = url.split('#filter/')[1].trim();

				// Try and parse the filters object from the query string.
				try {
					filters = JSON.parse(url);
				}
					// If it isn't a valid json, go back to homepage ( the rest of the code won't be executed ).
				catch(err) {
					window.location.hash = '#';
					return
				}

				renderFilterResults(filters, profiles);
			}

		};

		if(map[temp]){
			map[temp]();			
		} else {
			renderErrorPage();
		}
}



function renderprofilesPage(data){     // Yay! Got it!

   var profilepage = document.getElementById("all-profiles");
   var listColl = getprofilesCollection();

   // This was very frustrating; buildprofileList had not executed yet, I had to move render('/') into 
   // the getJSON function; tok ages to find out! - So there's a difference between elements already 
   // present in HTML, and those added by DOM Manipulation
   iterateCollection(listColl)(function(oneItem, i){
   		addClass(oneItem, 'hidden');

  		data.forEach(function(item){
   			if(oneItem.dataset.index == item.username){
   				removeClass(oneItem, 'hidden');
   			}
   		})
   })

   addClass(profilepage, "visible");
}



function renderSingleprofilePage(index, data){
	var page = document.getElementById("single-profile");
	var container = document.getElementById("preview-large");

	if(data.length){
		data.forEach(function(item){
			console.log("user", item.username);
			console.log("index", index);
			if(item.username == index){
				container.querySelectorAll("h3")[0].innerHTML = item.username;
				container.querySelectorAll("img")[0].setAttribute("src", "../assets/images/" + item.image + ".jpg");
				//container.querySelectorAll("p")[0].innerHTML = item.description;

			 var superp = document.createElement("p");
		   	 superp.innerHTML = "<span>Superpower:</span> " + item.superpower.type + "<br /> \
		   	 <span>Speed:</span> " + item.superpower.speed.value + " " + item.superpower.speed.units;

		   	 var list = document.createElement("ul");
		   	 addClass(list, "profile-description");
		   	 var html = printLists(item.lists);
		   	 list.innerHTML = html;

		   	 container.appendChild(superp).appendChild(list);
			}             

		});
	}

	addClass(page, "visible");
}




// Find and render the filtered data results. Arguments are:
// filters - our global variable - the object with arrays about what we are searching for.
// profiles - an object with the full profiles list (from profile.json).
function renderFilterResults(filters, profiles){

		// This array contains all the possible filter criteria.
	var criteria = ['JavaScript interests', 'Other programming'],
		results = [],
		isFiltered = false;

	// Uncheck all the checkboxes.
	// We will be checking them again one by one.
	uncheck(inputEls);

	criteria.forEach(function (c) {

		// Check if each of the possible filter criteria is actually in the filters object.
		if(filters[c] && filters[c].length){


			// After we've filtered the profiles once, we want to keep filtering them.
			// That's why we make the object we search in (profiles) to equal the one with the results.
			// Then the results array is cleared, so it can be filled with the newly filtered data.
			if(isFiltered){
				profiles = results;
				results = [];
			}


			// In these nested 'for loops' we will iterate over the filters and the profiles
			// and check if they contain the same values (the ones we are filtering by).

			// Iterate over the entries inside filters.criteria (remember each criteria contains an array).
			filters[c].forEach(function (filter) {
                
				// Iterate over the profiles.
				profiles.forEach(function (item){
					// If the profile has the same specification value as the one in the filter
					// push it inside the results array and mark the isFiltered flag true.
					/*if(typeof item.lists[c] == 'number'){
						if(item.lists[c] == filter){
							results.push(item);
							isFiltered = true;
						}
					} */

					//if(typeof item.lists[c] == 'string'){
						if(item.lists[c].indexOf(filter) != -1){						
							results.push(item);
							console.log("results", results);
							isFiltered = true;
							console.log("isFilteed", isFiltered);
						}
					//} 

				});

				// Here we can make the checkboxes representing the filters true,
				// keeping the app up to date.
				if(c && filter){

					iterateCollection(inputEls)(function(inputEl, i){
						if(inputEl.getAttribute("name") == c && inputEl.value == filter){
							inputEl.checked = true;
						}
					});

					// $('input[name='+c+'][value='+filter+']').prop('checked',true);
				}
			});
		}

	});

	// Call the renderprofilesPage.
	// As it's argument give the object with filtered profiles.
	renderprofilesPage(results);
}




function renderErrorPage(){
  addClass(document.getElementById("error"), "visible");
}




// Get the filters object, turn it into a string and write it into the hash
function createQueryHash(filters){

	console.log(filters);
	if(!isEmpty(filters)){
		window.location.hash = "#filter/" + JSON.stringify(filters);
		
	} else {
		window.location.hash = '#';
	} 

}



// common functions

function addClass(el, className){
	if(el.classList){
		el.classList.add(className);
	} else {
		el.ClassName =+ ' ' + className;
	}
}


function removeClass(el, className){
		if (el.classList){
		  		el.classList.remove(className);
		} else {
	  		el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
}


function hasClass(el, className){
	return el.classList.contains(className);
}


function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}



// This function is from https://imbuzu.wordpress.com/2014/02/01/iterating-over-an-htmlcollection/
// You call it like this (for example): 
/* iterateCollection(nodes)(function(node, i) {
  node.style.left = "10px";
});  */
function iterateCollection (collection) {   
  return function(f) {
    for(var i = 0; collection[i]; i++) {
      f(collection[i], i);
    }
  }
}



function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}


function capitalize(theString){
	return theString.charAt(0).toUpperCase() + theString.substring(1);
}





function buildprofileList(data){
   var profiles = document.getElementById("profiles");

   for(var i = 0, n = data.length; i < n; i++ ){
   	 var elementsArray = [];
   	 var obj = data[i];
   	 var item = document.createElement("li");
   	 	 item.dataset.index = obj.username;
   	 addClass(item, "listitem");

   	 var link1 = document.createElement("a");
   	 link1.href = "#";
   	 addClass(link1, "profile-photo");
   	 var image = document.createElement("img");
   	 image.setAttribute("height", "110");
   	 image.setAttribute("alt", obj.username);
   	 image.setAttribute("src", "assets/images/" + obj.image + ".jpg");
   	 link1.appendChild(image); 
   	 elementsArray.push(link1);
   	
     var h2 = document.createElement("h2");
   	 var link2 = document.createElement("a");
   	 link2.href = "#";
   	 link2.appendChild(document.createTextNode(obj.username));
   	 h2.appendChild(link2);
   	 elementsArray.push(h2);


 	 var superp = document.createElement("p");
   	 /*var superpSpan = document.createElement("span");
   	 superpSpan.appendChild(document.createTextNode("Superpower: "))
   	 superp.appendChild(superpSpan);
   	 superpSpan.insertAdjacentHTML('afterend', obj.superpower.type + "<br />"); */
     // Easier like this:
   	 superp.innerHTML = "<span>Superpower:</span> " + obj.superpower.type + "<br /> \
   	 <span>Speed:</span> " + obj.superpower.speed.value + " " + obj.superpower.speed.units;
     elementsArray.push(superp);


   	 var list = document.createElement("ul");
   	 addClass(list, "profile-description");
   	 var html = printLists(obj.lists);
   	 list.innerHTML = html;
   	 elementsArray.push(list);  

   	 // instead of for loop, we can use foreach
   	 elementsArray.forEach(function(element){
   	 	item.appendChild(element);
   	 }); 

   	 profiles.appendChild(item);
   	}

   	var listItems = getprofilesCollection();
   	addprofilesEventlisteners(listItems);
}

function getprofilesCollection(){
	var profilesColl = document.getElementById("all-profiles").getElementsByClassName("listitem");
	return profilesColl;
}

function addprofilesEventlisteners(HTMLCollection){
   iterateCollection(HTMLCollection)(function(item, i){
   item.addEventListener('click', function(e){
   		e.preventDefault();
   		var index = item.dataset.index;
   		var hash = "profile/" + index;
   		window.location.hash = hash;
   	  	});	
    });
}


function printLists(lists){
	var html = "";
	for(key in lists){
		if(lists.hasOwnProperty(key)){
				var listitems = "";
			    lists[key].forEach(function(item){
			    	listitems += item + ", ";
			    });
			    listitems = listitems.slice(0, -2);
				html += "<li><span>" + key + ":</span> " + listitems + "<br /></li>";
		}
	}

	return html;
}



function getJSON(url, callback){
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function(){
		if (request.status >= 200 && request.status < 400) {
			// success
			var data = JSON.parse(request.responseText);
			// console.log(data);
			callback(data);

		} else {
			console.log("could not parse text");
		}
	};

	request.onerror = function(){
		console.log("connection error");
	};

	request.send();
}
