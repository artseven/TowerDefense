﻿(function($, undefined)
{
    function createBackground(width, height, scale)
    {
        var bgcanvas = document.createElement('canvas');
        
        bgcanvas.width = width;
        bgcanvas.height = height;
        
        var bgcontext = bgcanvas.getContext('2d');
        
        bgcontext.fillStyle = '#c7e2a4';
        bgcontext.fillRect(0, 0, width, height);
        
        for (var x = 0; x <= width; x += scale)
        {
            bgcontext.moveTo(x, 0);
            bgcontext.lineTo(x, height);
        }
        
        for (var y = 0; y <= height; y += scale)
        {
            bgcontext.moveTo(0, y);
            bgcontext.lineTo(width, y);
        }
        
        bgcontext.lineWidth = 1;
        bgcontext.strokeStyle = '#bed499'
        bgcontext.stroke();
        
        return bgcanvas;
    }
    
    TowerDefense = function(canvas)
    {
        var game = this;
        var context = canvas.getContext('2d');
        var $canvas = $(canvas);
        
        var mouseOver = false;
        var scale = 20.0;
        var bg = 
        { 
            canvas: null, 
            scale: 0 
        };
        
        var map = null;
        var objectSelected = null;
        var objectBeingPlaced = null;
        
        function selectObject(obj)
        {
            if (objectSelected)
            {
                objectSelected.isSelected = false;
            }
            
            objectSelected = obj;
            
            if (objectSelected && objectSelected.isSelectable)
            {
                objectSelected.isSelected = true;
            }
        }
        
        function drawBackground()
        {
            if (bg.scale != scale)
            {
                bg.scale = scale;
                bg.canvas = createBackground(canvas.width, canvas.height, scale);
            }
            
            context.drawImage(bg.canvas, 0, 0);
        }

        function mainLoop()
        {
            drawBackground();
            
            for (var i in map.objects)
            {
                map.objects[i].paint(context);
            }
            
            if (mouseOver && (objectBeingPlaced !== null))
            {
                objectBeingPlaced.paint(context);
            }
        }
        
        function onMouseMove(e)
        {
            var x = game.descale(e.offsetX);
            var y = game.descale(e.offsetY);
            
            if (objectBeingPlaced !== null)
            {
                var size = objectBeingPlaced.size();
                
                if ((x + size <= map.width) &&
                    (y + size <= map.height))
                {
                    objectBeingPlaced.x(x);
                    objectBeingPlaced.y(y);
                    
                    objectBeingPlaced.isPlaceholderValid = map.isEmpty(x, y, size, size);
                }
                                
                return;
            }
            
            var objectUnderMouse = map.at(x, y);
            
            if (objectUnderMouse && objectUnderMouse.isSelectable)
            {
                $canvas.css('cursor', 'pointer');
            }
            else
            {
                $canvas.css('cursor', 'auto');
            }

            for (var i in map.objects)
            {
                if (map.objects[i].setTarget instanceof Function)
                {
                    map.objects[i].setTarget(x, y);
                }
            }
        }
        
        function onMouseUp(e)
        {
            if (objectBeingPlaced !== null)
            {
                if (objectBeingPlaced.isPlaceholderValid)
                {
                    map.addObject(objectBeingPlaced);
                    
                    objectBeingPlaced.isPlaceholder = false;
                    objectBeingPlaced = null;
                }
            }
            else
            {
                var x = game.descale(e.offsetX);
                var y = game.descale(e.offsetY);
                
                selectObject(map.at(x, y));
            }            
        }
        
        game.scale = function(n)
        {
            return n * scale;
        };
        
        game.descale = function(n)
        {
            return Math.floor(n / scale);
        };
        
        game.beginPlaceObject = function(obj)
        {
            obj.isPlaceholder = true;
            obj.isPlaceholderValid = true;
            
            objectBeingPlaced = obj;
        };
        
        var descaledWidth = game.descale(canvas.width);
        var descaledHeight = game.descale(canvas.height);
        
        var tower = TowerDefense.newTower(game);
        
        tower.x(2);
        tower.y(descaledHeight - 6);
        
        map = new TowerDefense.Map(descaledWidth, descaledHeight);
        map.addObject(tower);

        $canvas.hover(
            function() { mouseOver = true; },
            function() { mouseOver = false; }
        );

        $canvas.mousemove(onMouseMove);
        $canvas.mouseup(onMouseUp);
        
        window.setInterval(mainLoop, 33);
    };
    
})(jQuery);