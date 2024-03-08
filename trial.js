class Base{
    constructor(a,b){
        this.a=a;
        this.b=b;
    }
}
class Child extends Base{
    constructor(a,b,c){
        super(a,b);
        this.c=c;
    }
}

const instance = new Base(12,44)
const instance2 = new Child(34,65,89)

console.log(instance)
console.log(instance2)