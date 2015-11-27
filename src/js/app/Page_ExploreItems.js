var Page_ExploreItems = function() {
	this.Vue = new Vue({
		el: '.explore-items', // @todo cohérence où est nommée la page
		data: {items: {}, word: '', focus: {}} // @todo add items[0].starred = true/false
	});
	
	Page.apply(this, arguments);
	
	this.explore_speedX = 0;
	this.explore_speedY = 0;
}

Page_ExploreItems.prototype = Object.create(Page.prototype);

Page_ExploreItems.prototype.exploreItemsByWord = function (word)
{
	$.ajax({
		type: "GET",
		url: '/api/v1/words/'+ encodeURIComponent(word) +'/items',
		success: function(data) {
			var items = data.items;
			items = items.map(function(d) { d['words'] = []; return d; }); // so that Vue.js watches changes on 'words'
			this.Vue.items = items;
			this.Vue.word = word;
		}.bind(this)
	});
}

Page_ExploreItems.prototype.exploreSimilarItems = function (item_id)
{
	$.ajax({
		type: "GET",
		url: '/api/v1/items/'+ item_id +'/similar',
		success: function(data) {
			var items = data.items;
			items = items.map(function(d) { d['words'] = []; return d; }); // so that Vue.js watches changes on 'words'
			this.Vue.items = items;
			this.Vue.word = data.name;
		}.bind(this)
	});
}

Page_ExploreItems.prototype.exploreProfile = function (user_id)
{
	$.ajax({
		type: "GET",
		url: '/api/v1/user/' + user_id +'/stars',
		success: function(data) {
			this.Vue.items = data.items;
			this.Vue.word = 'Profil de ' + data.username;
		}.bind(this)
	});
}

Page_ExploreItems.prototype.bindEvents = function () {
	
	$('.explore-items .item-list').masonry({// options
  itemSelector: '.item',
  columnWidth: 200
        });
	
	$('.mask').click(function(){ console.log('gift'); $('.item-focus').addClass('hidden'); });
	$('.flexor').click(function(e){ if ($(e.target).is('.flexor')) $('.item-focus').addClass('hidden'); });
    // $('.top-bar').addClass('show-bar');
	$('.explore-items').on('click','.star',function(e){
		
		if ($(e.target).hasClass('starred'))
		{
			$.ajax({
				type: "DELETE",
				url: '/api/v1/items/' + $(e.target).data('id') +'/star',
				success: function(data) {
					this.Vue.focus.starred = false;
				}.bind(this)
			});
		}
		else
		{
			$.ajax({
				type: "PUT",
				url: '/api/v1/items/' + $(e.target).data('id') +'/star',
				success: function(data) {
					this.Vue.focus.starred = true;
				}.bind(this)
			});
		}
		
		return false;
	}.bind(this));
	
    $('.add-word').submit(function(e){
		
		 $.ajax({
            type: "PUT",
			url: '/api/v1/items/' + this.Vue.focus.id +'/words/'+$('.word-to-add').val(),
            success: function(response) {
				app.flashMessage('Votre mot <strong>'+$('.word-to-add').val()+'</strong> a été ajouté à l\'&oelig;uvre.');
				$('.word-to-add').val('');
            },
			error: function(error) {
				console.error(error);	
			}
        });
		
		return false;
	}.bind(this));
	
    /*
    // Code de retour à l'exploration des mots
    $('.explore-items').on('click','.star',function(e){
		$.ajax({
			type: "PUT",
			url: '/api/v1/items/' + $(e.target).data('id') +'/star',
			success: function(data) {
				alert('starred');
			}.bind(this)
		});
		return false;
	});*/
	
	$('.explore-items').on('click','.similar',function(e){
		this.exploreSimilarItems(parseInt($(e.target).data('id')));
	}.bind(this));
	

    
    
	var that = this;
	$('.explore-items').on('click','.item.in-list', function(e) {
		var focus_id = $(this).data('id');
		that.Vue.focus = that.Vue.items.filter(function(a){ return a.id == focus_id; })[0];
		$('.item-focus').removeClass('hidden');
		$('.item-focus .star, .item-focus .similar').attr('data-id',$(this).data('id'));
		
		$.ajax({
			type: "GET",
			url: '/api/v1/items/' + focus_id +'/words',
			success: function(data) {
				that.Vue.focus.words = data.words;
			}
		});
	});
	
	setTimeout(function() {
		$('.explore-items .word.spotlight').addClass('bordered');
	}, 500);

	
	
	
	
	
	
	
	$(document).on('mousemove', function(e) {
		
		if ($('.item-focus.hidden').length == 0) {
			this.explore_speedX = 0;
			this.explore_speedY = 0;
			return;
		}
		
		var window_width = $(window).width();
		var window_height = $(window).height();
		var middle_zone_width = 100;
		var middle_zone_height = 100;
		var minimal_difference = 0;

		if (e.pageX > window_width/2)
		{
			if (e.pageX < window_width/2 + middle_zone_width)
				var differenceX = minimal_difference;
			else
				var differenceX = e.pageX - (window_width/2 + middle_zone_width);
		}
		else
		{
			if (e.pageX > window_width/2 - middle_zone_width)
				var differenceX = minimal_difference;
			else
				var differenceX = e.pageX - (window_width/2 - middle_zone_width);
		}
		
		if (e.pageY > window_height/2)
		{
			if (e.pageY < window_height/2 + middle_zone_height)
				var differenceY = minimal_difference;
			else
				var differenceY = e.pageY - (window_height/2 + middle_zone_height);
		}
		else
		{
			if (e.pageY > window_height/2 - middle_zone_height)
				var differenceY = minimal_difference;
			else
				var differenceY = e.pageY - (window_height/2 - middle_zone_height);
		}

		this.explore_speedX = -differenceX*0.2;
		this.explore_speedY = -differenceY*0.2;
	}.bind(this));
	

	this.onAnimationFrame = function () {
		this.updateTranslatable();
	};
	
	/*setTimeout(function(){
		$('.item-list').removeClass('not-ready');
		TweenMax.set($('.item-list'), {x: -$('.item-list').width()/2, y: -$('.item-list').height()/2})
		window.requestAnimationFrame(this.onAnimationFrame.bind(this));
	}.bind(this),1000);*/
	$('.item-list').removeClass('not-ready');
	TweenMax.set($('.item-list'), {x: -$('.item-list').width()/2})
		window.requestAnimationFrame(this.onAnimationFrame.bind(this));
}

Page_ExploreItems.prototype.updateTranslatable = function () {
	if($('.item-list').get(0)._gsTransform !== undefined && ($('.item-list').get(0)._gsTransform.x+this.explore_speed >= 0 || $('.item-list').get(0)._gsTransform.x+this.explore_speed <= -$('.item-list').width() + $(window).width()))
	{
		
	}
	else
	{
		TweenMax.to($('.item-list'), 1, {x: '+='+this.explore_speedX, y: '+='+this.explore_speedY, ease: Power1.easeOut})
		// TweenMax.to($('.item-list'), 1, {x: '+=1', y: '+=1',  ease: Power1.easeOut})
	}
	window.requestAnimationFrame(this.onAnimationFrame.bind(this));
}


Page_ExploreItems.prototype.unbindEvents = function () {
	$('.explore-items').off('click');
	
	$('.explore-items').off('click','.similar');
	
	$('.explore-items').off('click','.item');
	
	$('.explore-items .word.spotlight').removeClass('bordered');
    
    $('.top-bar').removeClass('show-bar');
}