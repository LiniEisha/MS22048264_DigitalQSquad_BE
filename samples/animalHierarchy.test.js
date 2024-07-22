// File: animalHierarchy.test.js
(async () => {
    const { expect } = await import('chai');
    const { Animal, Dog, Bulldog, Beagle, Poodle, Cat, Bird } = require('./animalHierarchy');

    describe('Animal Hierarchy', () => {
        it('should create an Animal and make a sound', () => {
            const animal = new Animal('Generic Animal', 5);
            expect(animal.makeSound()).to.equal('Generic Animal makes a sound.');
        });

        it('should create a Dog and make a sound', () => {
            const dog = new Dog('Generic Dog', 3);
            expect(dog.makeSound()).to.equal('Generic Dog barks.');
        });

        it('should create a Bulldog and make a specific sound', () => {
            const bulldog = new Bulldog('Bulldog', 4);
            expect(bulldog.makeSound()).to.equal('Bulldog the Bulldog growls.');
        });

        it('should create a Beagle and make a specific sound', () => {
            const beagle = new Beagle('Beagle', 2);
            expect(beagle.makeSound()).to.equal('Beagle the Beagle howls.');
        });

        it('should create a Poodle and make a specific sound', () => {
            const poodle = new Poodle('Poodle', 1);
            expect(poodle.makeSound()).to.equal('Poodle the Poodle yips.');
        });

        it('should create a Cat and make a sound', () => {
            const cat = new Cat('Cat', 3);
            expect(cat.makeSound()).to.equal('Cat meows.');
        });

        it('should create a Bird and make a sound', () => {
            const bird = new Bird('Bird', 2);
            expect(bird.makeSound()).to.equal('Bird chirps.');
        });
    });
})();
