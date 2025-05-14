class Camera 
{
    constructor(sceneAspect)
    {
        this.fov = 80.0;
        this.speed = .1;
        this.alpha = 1.5;
        this.eye = new Vector3([0,0,3]);
        this.at = new Vector3([54,0,.68]);
        //this.at = new Vector3([8.333528518676758, 0, 6.667000770568848]);
        this.up = new Vector3([0,1,0]);
        //this.eye = new Vector3([8.196281433105469, 0, 4.267163276672363]);
        this.rotMat = new Matrix4();
        this.forward = new Vector3();
        this.sideways = new Vector3();

        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );

        this.projectionMatrix = new Matrix4().setPerspective(
            this.fov,
            sceneAspect,
            .1,
            100
        );
    }

    moveForwardsBackwards(forward) 
    {
        if (forward) 
        {
            this.forward.set(this.at);
            this.forward.sub(this.eye);
        }
        else 
        {
            this.forward.set(this.eye);
            this.forward.sub(this.at);
        }
        this.forward.normalize();
        this.forward.mul(this.speed);

        this.eye.add(this.forward);
        this.at.add(this.forward);

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveSideways(left) 
    {
        this.forward.set(this.at);
        this.forward.sub(this.eye);

        if (left) this.sideways.set(Vector3.cross(this.up, this.forward));
        else 
        {
            this.sideways.set(Vector3.cross(this.forward, this.up));
        }
        this.sideways.normalize();
        this.sideways.mul(this.speed);

        this.eye.add(this.sideways);
        this.at.add(this.sideways);

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    pan(angle) 
    {
        if (angle) this.rotMat.setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        else 
        {
            this.rotMat.setRotate(-(this.alpha), this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        }
        this.forward.set(this.at);
        this.forward.sub(this.eye);

        this.forward.set(this.rotMat.multiplyVector3(this.forward));
        this.forward.add(this.eye);
        this.at.set(this.forward);

        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }
}