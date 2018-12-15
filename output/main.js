define(["require", "exports", "knockout", "knockout-dragdrop"], function (require, exports, knockout_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AttackResultsHits {
        constructor(numCrits, numHits, numMisses) {
            this.numMisses = 0;
            this.numHits = 0;
            this.numCrits = 0;
            this.add = (other) => {
                this.numMisses = this.numMisses + other.numMisses;
                this.numHits = this.numHits + other.numHits;
                this.numCrits = this.numCrits + other.numCrits;
                return this;
            };
            this.numCrits = numCrits || 0;
            this.numHits = numHits || 0;
            this.numMisses = numMisses || 0;
        }
    }
    class AttackResultsDamage {
        constructor() {
            this.acid = 0;
            this.bludgeoning = 0;
            this.cold = 0;
            this.fire = 0;
            this.force = 0;
            this.lightning = 0;
            this.necrotic = 0;
            this.piercing = 0;
            this.poison = 0;
            this.psychic = 0;
            this.radiant = 0;
            this.slashing = 0;
            this.thunder = 0;
            this.add = (other, half) => {
                this.acid += other.acid;
                this.bludgeoning += other.bludgeoning;
                this.cold += other.cold;
                this.fire += other.fire;
                this.force += other.force;
                this.lightning += other.lightning;
                this.necrotic += other.necrotic;
                this.piercing += other.piercing;
                this.poison += other.poison;
                this.psychic += other.psychic;
                this.radiant += other.radiant;
                this.slashing += other.slashing;
                this.thunder += other.thunder;
                return this;
            };
            this.half = () => {
                this.acid = Math.floor(this.acid / 2);
                this.bludgeoning = Math.floor(this.bludgeoning / 2);
                this.cold = Math.floor(this.cold / 2);
                this.fire = Math.floor(this.fire / 2);
                this.force = Math.floor(this.force / 2);
                this.lightning = Math.floor(this.lightning / 2);
                this.necrotic = Math.floor(this.necrotic / 2);
                this.piercing = Math.floor(this.piercing / 2);
                this.poison = Math.floor(this.poison / 2);
                this.psychic = Math.floor(this.psychic / 2);
                this.radiant = Math.floor(this.radiant / 2);
                this.slashing = Math.floor(this.slashing / 2);
                this.thunder = Math.floor(this.thunder / 2);
                return this;
            };
        }
        get total() {
            return Array.from(this.asMap.values()).reduce((total, x) => total + x, 0);
        }
        get asMap() {
            return new Map([
                ['acid', this.acid],
                ['bludgeoning', this.bludgeoning],
                ['cold', this.cold],
                ['fire', this.fire],
                ['force', this.force],
                ['lightning', this.lightning],
                ['necrotic', this.necrotic],
                ['piercing', this.piercing],
                ['poison', this.poison],
                ['psychic', this.psychic],
                ['radiant', this.radiant],
                ['slashing', this.slashing],
                ['thunder', this.thunder],
            ]);
        }
    }
    class AttackResultsConditions {
        constructor() {
            this.grappled = false;
            this.restrained = false;
            this.prone = false;
            this.add = (other) => {
                this.grappled = this.grappled || other.grappled;
                this.restrained = this.restrained || other.restrained;
                this.prone = this.prone || other.prone;
                return this;
            };
        }
        get asArray() {
            const results = [];
            if (this.grappled)
                results.push('grappled');
            if (this.restrained)
                results.push('restrained');
            if (this.prone)
                results.push('prone');
            return results;
        }
    }
    class AttackResults {
        constructor() {
            this.hits = new AttackResultsHits();
            this.damage = new AttackResultsDamage();
            this.conditions = new AttackResultsConditions();
            this.add = (other) => {
                this.hits.add(other.hits);
                this.damage.add(other.damage);
                this.conditions.add(other.conditions);
                return this;
            };
        }
    }
    class DamageInfo {
        constructor() {
            this.count = knockout_1.observable(0).extend({ numeric: 0 });
            this.sides = knockout_1.observable(1).extend({ numeric: 0 });
            this.modifier = knockout_1.observable(0).extend({ numeric: 0 });
            this.type = knockout_1.observable('bludgeoning');
        }
    }
    class SaveInfo {
        constructor() {
            this.attribute = knockout_1.observable('strength');
            this.dc = knockout_1.observable(10).extend({ numeric: 0 });
        }
    }
    class SaveModifiers {
        constructor() {
            this.strength = knockout_1.observable(0).extend({ numeric: 0 });
            this.dexterity = knockout_1.observable(0).extend({ numeric: 0 });
            this.constitution = knockout_1.observable(0).extend({ numeric: 0 });
            this.intelligence = knockout_1.observable(0).extend({ numeric: 0 });
            this.wisdom = knockout_1.observable(0).extend({ numeric: 0 });
            this.charisma = knockout_1.observable(0).extend({ numeric: 0 });
        }
    }
    class Effect {
        constructor() {
            this.condition = knockout_1.observable();
            this.save = knockout_1.observable();
            this.damage = knockout_1.observable();
            this.toggleCondition = () => {
                if (this.condition() === undefined)
                    this.condition('grappled');
                else
                    this.condition(undefined);
                return true;
            };
            this.toggleSave = () => {
                if (this.save() === undefined)
                    this.save(new SaveInfo());
                else
                    this.save(undefined);
                return true;
            };
            this.toggleDamage = () => {
                if (this.damage() === undefined)
                    this.damage(new DamageInfo());
                else
                    this.damage(undefined);
                return true;
            };
        }
    }
    class Creature {
        constructor() {
            this.name = knockout_1.observable('unknown');
        }
    }
    class Defender extends Creature {
        constructor() {
            super(...arguments);
            this.attackers = knockout_1.observableArray();
            this.attackDc = knockout_1.observable(10).extend({ numeric: 0 });
            this.saveAdvantage = knockout_1.observable('normal');
            this.saveModifiers = knockout_1.observable(new SaveModifiers());
        }
    }
    class Attacker extends Creature {
        constructor() {
            super(...arguments);
            this.count = knockout_1.observable(1).extend({ numeric: 0 });
            this.advantage = knockout_1.observable('normal');
            this.attackModifier = knockout_1.observable(0).extend({ numeric: 0 });
            this.damage = knockout_1.observable(new DamageInfo());
            this.onHitEffect = knockout_1.observable();
            this.toggleOnHitEffect = () => {
                if (this.onHitEffect() === undefined)
                    this.onHitEffect(new Effect());
                else
                    this.onHitEffect(undefined);
                return true;
            };
        }
    }
    class ViewModel {
        constructor() {
            this.defenders = knockout_1.observableArray();
            this.attackers = knockout_1.observableArray();
            this.selectedAttacker = knockout_1.observable();
            this.selectedDefender = knockout_1.observable();
            this.results = knockout_1.observableArray();
            /// rolling
            this.onRoll = () => {
                this.results.removeAll();
                for (let defender of this.defenders()) {
                    const result = this.rollOneDefender(defender);
                    this.results.push({ defender: defender.name(), results: result });
                }
            };
            this.rollOneDefender = (defender) => {
                const results = new AttackResults();
                for (let attacker of defender.attackers()) {
                    results.add(this.rollOneAttacker(attacker, defender));
                }
                return results;
            };
            this.rollOneAttacker = (attacker, defender) => {
                const results = new AttackResults();
                for (let i = 0; i < attacker.count(); ++i) {
                    const dieRoll = rollDie(20, attacker.advantage());
                    const crit = dieRoll === 20;
                    const hit = !crit && dieRoll + attacker.attackModifier() >= defender.attackDc();
                    const miss = !crit && !hit;
                    results.hits.add(new AttackResultsHits(crit ? 1 : 0, hit ? 1 : 0, miss ? 1 : 0));
                    if (miss)
                        continue;
                    if (attacker.onHitEffect()) {
                        const { damage, conditions } = this.applyOnHitEffect(attacker.onHitEffect(), defender);
                        results.damage.add(damage);
                        results.conditions.add(conditions);
                    }
                    results.damage.add(this.calculateDamage(attacker.damage(), crit));
                }
                return results;
            };
            this.applyOnHitEffect = (effect, defender) => {
                const result = { damage: new AttackResultsDamage(), conditions: new AttackResultsConditions() };
                const save = effect.save();
                if (save) {
                    const dieRoll = rollDie(20, defender.saveAdvantage());
                    const saveAttribute = save.attribute();
                    const saveModifier = defender.saveModifiers()[saveAttribute]();
                    if (dieRoll + saveModifier >= save.dc()) {
                        // saved, if there is damage do half
                        const damage = effect.damage();
                        if (damage) {
                            result.damage.add(this.calculateDamage(damage, false).half());
                        }
                        return result;
                    }
                }
                // either no save allowed or they failed the save, so full condition and damage
                const condition = effect.condition();
                if (condition) {
                    result.conditions[condition] = true;
                }
                const damage = effect.damage();
                if (damage) {
                    result.damage.add(this.calculateDamage(damage, false));
                }
                return result;
            };
            this.calculateDamage = (damageInfo, crit) => {
                const results = new AttackResultsDamage();
                const dieCount = damageInfo.count() * (crit ? 2 : 1);
                let damageRolls = rollDice(dieCount, damageInfo.sides(), 'normal').reduce((total, roll) => total + roll, 0);
                const damage = damageRolls + damageInfo.modifier();
                results[damageInfo.type()] = damage;
                return results;
            };
            /// ui interactions
            this.onSelectDefender = (defender) => {
                this.selectedDefender(defender);
                this.selectedAttacker(undefined);
            };
            this.onSelectAttacker = (attacker) => {
                this.selectedAttacker(attacker);
                this.selectedDefender(undefined);
            };
            this.onAddDefender = () => {
                this.defenders.push(new Defender());
            };
            this.onRemoveDefender = (defender) => {
                this.defenders.remove(defender);
                if (this.selectedDefender() === defender)
                    this.selectedDefender(undefined);
            };
            this.onAddAttacker = () => {
                this.attackers.push(new Attacker());
            };
            this.onRemoveAttacker = (attacker) => {
                this.removeAttacker(attacker);
                if (this.selectedAttacker() === attacker)
                    this.selectedAttacker(undefined);
            };
            this.onAttackerDroppedOnDefender = (attacker, defender) => {
                this.removeAttacker(attacker);
                defender.attackers.push(attacker);
            };
            this.onAttackerDroppedOnUnusedList = (attacker) => {
                this.removeAttacker(attacker);
                this.attackers.push(attacker);
            };
            /// drag and drop functionality
            this.onDragStart = (attacker, dragEvent) => {
                dragEvent.dataTransfer.setData("text", dragEvent.target.id);
                return true;
            };
            this.onDragOver = (unused, dragEvent) => {
                const targetElement = dragEvent.currentTarget;
                targetElement.classList.add('drag-over');
                dragEvent.preventDefault();
                dragEvent.dataTransfer.dropEffect = 'move';
                return true;
            };
            this.onDragLeave = (unused, dragEvent) => {
                const targetElement = dragEvent.currentTarget;
                targetElement.classList.remove('drag-over');
                dragEvent.preventDefault();
                return true;
            };
            this.onDropOnDefender = (defender, dragEvent) => {
                const attacker = knockout_1.dataFor(document.getElementById(dragEvent.dataTransfer.getData('text')));
                dragEvent.preventDefault();
                this.onAttackerDroppedOnDefender(attacker, defender);
                return true;
            };
            this.onDropOnAttackers = (usused, dragEvent) => {
                const attacker = knockout_1.dataFor(document.getElementById(dragEvent.dataTransfer.getData('text')));
                dragEvent.preventDefault();
                this.onAttackerDroppedOnUnusedList(attacker);
                return true;
            };
            this.removeAttacker = (attacker) => {
                if (this.attackers.remove(attacker).length !== 0)
                    return;
                for (let defender of this.defenders()) {
                    if (defender.attackers.remove(attacker).length !== 0)
                        return;
                }
                throw new Error(`unable to find attacker to remove them`);
            };
        }
    }
    /// Knockout Setup
    ;
    knockout_1.extenders.numeric = function (target, precision) {
        //create a writable computed observable to intercept writes to our observable
        const result = knockout_1.pureComputed({
            read: target,
            write: newValue => {
                const current = target();
                const roundingMultiplier = Math.pow(10, precision);
                const newValueAsNum = isNaN(newValue) ? 0 : +newValue;
                const valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;
                //only write if it changed
                if (valueToWrite !== current) {
                    target(valueToWrite);
                }
                else {
                    //if the rounded value is the same, but a different value was written, force a notification for the current field
                    if (newValue !== current) {
                        target.notifySubscribers(valueToWrite);
                    }
                }
            }
        }).extend({ notify: 'always' });
        //initialize with current value to make sure it is rounded appropriately
        result(target());
        //return the new computed observable
        return result;
    };
    let id = 0;
    knockout_1.bindingHandlers.uniqueId = {
        'init': (element, valueAccessor) => {
            if (!valueAccessor())
                return;
            element.id = `unique-id-${++id}`;
        }
    };
    knockout_1.applyBindings(new ViewModel());
    /// Dice Helpers
    function randomInt(min_inclusive, max_inclusive) {
        min_inclusive = Math.ceil(min_inclusive);
        max_inclusive = Math.floor(max_inclusive);
        return Math.floor(Math.random() * (max_inclusive - min_inclusive + 1)) + min_inclusive;
    }
    function rollDie(sides, advantage) {
        const first_roll = randomInt(1, sides);
        switch (advantage) {
            case 'advantage': return Math.max(first_roll, randomInt(1, sides));
            case 'normal': return first_roll;
            case 'disadvantage': return Math.min(first_roll, randomInt(1, sides));
        }
    }
    function rollDice(count, sides, advantage) {
        const results = [];
        for (let i = 0; i < count; ++i) {
            results.push(rollDie(sides, advantage));
        }
        return results;
    }
});
//# sourceMappingURL=main.js.map