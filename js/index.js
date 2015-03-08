

var app = angular.module('IRCchat', []);

app.controller('indexCtrl',  function($scope) { 

    $scope.users = [];
    
    $scope.messages = [];
    
    $scope.message = '';
    $scope.nick = { name: '' };
    $scope.channel = '#schnitzelwirt';
    
    $scope.config = {
        canSend: false,
        loading: false,
        showPopup: true,
        listenersAdded: false,
        joined: false
    };
    
    
    var irc = require('irc'); 
    var client = null;
    
    $scope.ChangeNick = function(){ 
        $scope.config.canSend = false;
        $scope.config.showPopup = true;
    };
    
    $scope.AddEventListeners = function(){  
        
        if( !$scope.config.listenersAdded ){
            $scope.config.listenersAdded = true;

            client.addListener('message', function (from, to, message) { 

                var priv = (to == $scope.channel ? false : true);

                $scope.messages.push({ user: from, userDest: to, msg: message, private: priv });
                $scope.$apply();
            });

            client.addListener('join', function(channel, pnick) {  

                console.log('join ' + pnick);

                if(!$scope.config.joined){
                    $scope.nick.name = pnick;
                    $scope.config.canSend = true;
                    $scope.config.loading = false;
                    $scope.config.joined = true;
                }
                else{
                    $scope.users.push({ nick: pnick });
                }
                
                $scope.$apply();
            });

            client.addListener('quit', function(pnick) {  

                console.log('quit ' + pnick);
                var pos = -1;

                for(var i=0; i < $scope.users.length && pos < 0; i++)
                    if($scope.users[i].nick == pnick)
                        pos = i;
                
                if(pos != -1)
                    $scope.users.splice(pos, 1);

                $scope.$apply();
            });

            client.addListener('names', function(channel, names) { 
                var aux = Object.keys(names);

                console.log(names);
                
                aux.forEach(function(obj){
                    $scope.users.push({ nick: obj });     
                });

                $scope.$apply();
            });
            
            client.addListener('nick', function(oldnick, newnick, channels) { 
                                
                $scope.$apply(function(){ 
                    
                    if(oldnick == $scope.nick.name)
                        $scope.nick.name = newnick;
                    
                    for(var i=0; i < $scope.users.length; i++)
                        if($scope.users[i].nick == oldnick){
                            $scope.users[i].nick = newnick;
                            return;
                        }
                });
                
            });

             client.addListener('error', function(message) {
                console.log('error: ', message);
            });
        }
    };
    
    $scope.NickChanged = function(){ 
        
        if(client == null){
            client = new irc.Client('chat.freenode.net', $scope.nick.name, {
                channels: [$scope.channel]
            });

            $scope.AddEventListeners();

            $scope.config.loading = true;
        }
        else{ 
            console.log($scope.nick.name);
            client.send("NICK", $scope.nick.name);
            $scope.config.canSend = true;
        }
        
        $scope.config.showPopup = false;
    };
    
    
    $scope.SendMessage = function(){ 
        
        if($scope.config.canSend){ 
            
            var private = false;
            var dest = $scope.channel;
            
            if($scope.message[0] == '@'){
                
                
                arraux = $scope.message.split(' ');
                
                private = true;
                dest = arraux[0].substring(1);
                
                arraux.splice(0,1);
                $scope.message = arraux.join(' ');
            }
            
            
            $scope.messages.push(
                { 
                     user: $scope.nick.name, 
                     userDest: dest, 
                     msg: $scope.message, 
                     private: private
                }
            );
                
            client.say(dest, $scope.message);
                
            $scope.message = '';
        }
        
    };
    
   

});
    
              
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) { 
                
                scope.$apply(function (){ 
                    scope.$eval(attrs.ngEnter);
                });
 
                event.preventDefault();
            }
        });
    };
});