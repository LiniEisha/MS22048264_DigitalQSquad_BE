// File: animalHierarchy.js
class Animal {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }

    makeSound() {
        return `${this.name} makes a sound.`;
    }
}

class Dog extends Animal {
    constructor(name, age) {
        super(name, age);
    }

    makeSound() {
        return `${this.name} barks.`;
    }
}

class Bulldog extends Dog {
    constructor(name, age) {
        super(name, age);
    }

    makeSound() {
        return `${this.name} the Bulldog growls.`;
    }
}

class Beagle extends Dog {
    constructor(name, age) {
        super(name, age);
    }

    makeSound() {
        return `${this.name} the Beagle howls.`;
    }
}

class Poodle extends Dog {
    constructor(name, age) {
        super(name, age);
    }

    makeSound() {
        return `${this.name} the Poodle yips.`;
    }
}

class Cat extends Animal {
    constructor(name, age) {
        super(name, age);
    }

    makeSound() {
        return `${this.name} meows.`;
    }
}

class Bird extends Animal {
    constructor(name, age) {
        super(name, age);
    }

    makeSound() {
        return `${this.name} chirps.`;
    }
}

export { Animal, Dog, Bulldog, Beagle, Poodle, Cat, Bird };
