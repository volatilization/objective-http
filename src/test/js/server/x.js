class A {
    constructor({x, y, z}) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    with({
        x, y, z
    }) {
        return new A({x, y, z})
    }

    toSting() {
        return JSON.stringify({x: this.x, y: this.y, z: this.z})
    }        
}

function nigga() {
    return {y: 1488, z: 52}
} 

const a0 = new A({x: 'x', y: 'y', z: 'z'})
const a1 = a0.with({
    x: 10,
    ...nigga()
}) 

console.log(a0)
console.log(a1)
