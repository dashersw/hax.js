window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw;


function writeMessage(stage, message) {
    var context = stage.getContext();
    stage.clear();
    context.font = "18pt Calibri";
    context.fillStyle = "black";
    context.fillText(message, 10, 25);
}
;

var hx = {};

hx.Builder = function () {
    var that = this;
    this.canvas = document.getElementById('c');
    this.ctx = this.canvas.getContext('2d');

    this.world = new b2World(new b2Vec2(0, 0), true);

    this.buildGround();
    this.buildPlayers();
    this.buildBall();

    this.bindEvents();

    this.prepareDebugDraw();

    requestAnimFrame(function () {
        that.update();
    });

};

hx.Builder.prototype.prepareDebugDraw = function () {
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(this.ctx);
    debugDraw.SetDrawScale(hx.constants.World.SCALE);
    debugDraw.SetFillAlpha(1);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
}

hx.Builder.prototype.update = function () {
    var that = this;
    this.updatePlayers();
    this.world.Step(1 / 60, 10, 10);
    this.world.DrawDebugData();
    this.world.ClearForces();

    requestAnimFrame(function () {
        that.update();
    });
}

hx.constants = {};

hx.constants.World = {
    FRICTION:0.1,
    SCALE:30,
    WIDTH:940,
    HEIGHT:480
};

hx.constants.Ground = {
    DENSITY:1.0,
    FRICTION:1,
    RESTITUTION:0.5
};

hx.constants.Player = {
    DENSITY:1,
    FRICTION:0.5,
    RESTITUTION:0.2,
    AD:2,
    LD:2,
    MAG:12,
    RADIUS:0.5
};

hx.constants.Ball = {
    DENSITY:1,
    FRICTION:0,
    RESTITUTION:0.2,
    AD:2,
    LD:2,
    MAG:12,
    RADIUS:0.35
};

hx.constants.Directions = {
    39:0,
    40:3,
    37:2,
    38:1
}

hx.grounds = {};
hx.grounds.G1 = {
    top:[0, 10, hx.constants.World.WIDTH, 10],
    right:[hx.constants.World.WIDTH - 10, 0, 10, hx.constants.World.HEIGHT],
    bottom:[0, hx.constants.World.HEIGHT - 10, hx.constants.World.WIDTH, 10],
    left:[10, 0, 10, hx.constants.World.HEIGHT]
};

hx.Builder.prototype.buildGround = function () {
    var fixDef = new b2FixtureDef();
    fixDef.density = hx.constants.Ground.DENSITY;
    fixDef.friction = hx.constants.Ground.FRICTION;
    fixDef.restitution = hx.constants.Ground.RESTITUTION;
    fixDef.shape = new b2PolygonShape();

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;

    for (var b in hx.grounds.G1) {
        b = hx.grounds.G1[b];
        bodyDef.position.x = b[0] / hx.constants.World.SCALE;
        bodyDef.position.y = b[1] / hx.constants.World.SCALE;
        fixDef.shape.SetAsBox((b[2] / hx.constants.World.SCALE), (b[3] / hx.constants.World.SCALE));
        this.world.CreateBody(bodyDef).CreateFixture(fixDef);
    }
};


hx.Builder.prototype.buildPlayers = function () {
    this.player = new hx.Player(this.world);
    this.player2 = new hx.Player(this.world);
}

hx.Builder.prototype.buildBall = function () {
    this.ball = new hx.Ball(this.world);
}

hx.Builder.prototype.bindEvents = function () {
    var that = this;
    that.vec = new hx.Vec(0, 0);
    that.keys = [false, false, false, false];
    document.addEventListener('keydown', function (e) {
        if (e.keyCode > 36 && e.keyCode < 41) {
            that.keys[hx.constants.Directions[e.keyCode]] = true;
        }
    });
    document.addEventListener('keyup', function (e) {
        that.keys[hx.constants.Directions[e.keyCode]] = false;
    });
};

hx.Builder.prototype.updatePlayers = function () {
    var vec = new b2Vec2(0, 0);

    this.keys.forEach(function (key, i) {
        if (key) {
            var vec2 = new hx.Vec(i * -90, hx.constants.Player.MAG);
            vec.Add(vec2.vec);
        }
    });

    if (vec.Length() > 0)
        this.player.body.ApplyForce(vec, this.player.body.GetWorldCenter());
};


hx.Vec = function (deg, mag) {
    var deg = deg2rad(deg);
    this.vec = new b2Vec2(Math.cos(deg) * mag, Math.sin(deg) * mag);
};

deg2rad = function (deg) {
    return deg * Math.PI / 180;
};

hx.Player = function (world) {
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;

    var fixDef = new b2FixtureDef();
    fixDef.density = hx.constants.Player.DENSITY;
    fixDef.friction = hx.constants.Player.FRICTION;
    fixDef.restitution = hx.constants.Player.RESTITUTION;
    fixDef.shape = new b2CircleShape(hx.constants.Player.RADIUS);

    bodyDef.position.x = 100 / hx.constants.World.SCALE;
    bodyDef.position.y = 100 / hx.constants.World.SCALE;

    bodyDef.linearDamping = hx.constants.Player.LD;
    bodyDef.angularDamping = hx.constants.Player.AD;

    this.body = world.CreateBody(bodyDef);
    this.body.CreateFixture(fixDef);
};

hx.Ball = function (world) {
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;

    var fixDef = new b2FixtureDef();
    fixDef.density = hx.constants.Ball.DENSITY;
    fixDef.friction = hx.constants.Ball.FRICTION;
    fixDef.restitution = hx.constants.Ball.RESTITUTION;
    fixDef.shape = new b2CircleShape(hx.constants.Ball.RADIUS);

    bodyDef.position.x = 100 / hx.constants.World.SCALE;
    bodyDef.position.y = 100 / hx.constants.World.SCALE;

    bodyDef.linearDamping = hx.constants.Ball.LD;
    bodyDef.angularDamping = hx.constants.Ball.AD;

    this.body = world.CreateBody(bodyDef);
    this.body.CreateFixture(fixDef);
}


window.onload = function () {
    window.hxp = new hx.Builder();
};