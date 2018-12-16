import { observable, observableArray, applyBindings, extenders, pureComputed, bindingHandlers, dataFor } from 'knockout'
import 'knockout-dragdrop'

type Advantage = 'advantage' | 'normal' | 'disadvantage'
type Attribute = 'strength'|'dexterity'|'constitution'|'intelligence'|'wisdom'|'charisma'
type DamageType = 'acid'|'bludgeoning'|'cold'|'fire'|'force'|'lightning'|'necrotic'|'piercing'|'poison'|'psychic'|'radiant'|'slashing'|'thunder'
type ConditionType = 'grappled'|'prone'|'restrained'

class AttackResultsHits {
	numMisses: number = 0
	numHits: number = 0
	numCrits: number = 0
	constructor()
	constructor(numCrits: number, numHits: number, numMisses: number)
	constructor(numCrits?: number, numHits?: number, numMisses?: number) {
		this.numCrits = numCrits || 0
		this.numHits = numHits || 0
		this.numMisses = numMisses || 0
	}
	add = (other: AttackResultsHits): AttackResultsHits => {
		this.numMisses = this.numMisses + other.numMisses
		this.numHits = this.numHits + other.numHits
		this.numCrits = this.numCrits + other.numCrits
		return this
	}
}

class AttackResultsDamage {
	acid: number = 0
	bludgeoning: number = 0
	cold: number = 0
	fire: number = 0
	force: number = 0
	lightning: number = 0
	necrotic: number = 0
	piercing: number = 0
	poison: number = 0
	psychic: number = 0
	radiant: number = 0
	slashing: number = 0
	thunder: number = 0
	add = (other: AttackResultsDamage, half?: boolean): AttackResultsDamage => {
		this.acid += other.acid
		this.bludgeoning += other.bludgeoning
		this.cold += other.cold
		this.fire += other.fire
		this.force += other.force
		this.lightning += other.lightning
		this.necrotic += other.necrotic
		this.piercing += other.piercing
		this.poison += other.poison
		this.psychic += other.psychic
		this.radiant += other.radiant
		this.slashing += other.slashing
		this.thunder += other.thunder
		return this
	}
	half = (): AttackResultsDamage => {
		this.acid = Math.floor(this.acid / 2)
		this.bludgeoning = Math.floor(this.bludgeoning / 2)
		this.cold = Math.floor(this.cold / 2)
		this.fire = Math.floor(this.fire / 2)
		this.force = Math.floor(this.force / 2)
		this.lightning = Math.floor(this.lightning / 2)
		this.necrotic = Math.floor(this.necrotic / 2)
		this.piercing = Math.floor(this.piercing / 2)
		this.poison = Math.floor(this.poison / 2)
		this.psychic = Math.floor(this.psychic / 2)
		this.radiant = Math.floor(this.radiant / 2)
		this.slashing = Math.floor(this.slashing / 2)
		this.thunder = Math.floor(this.thunder / 2)
		return this
	}
	get total(): number {
		return Array.from(this.asMap.values()).reduce((total, x) => total + x, 0)
	}
	get asMap(): Map<string, number> {
		return new Map<string, number>([
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
		])
	}
}

class AttackResultsConditions {
	grappled: boolean = false
	restrained: boolean = false
	prone: boolean = false
	add = (other: AttackResultsConditions): AttackResultsConditions => {
		this.grappled = this.grappled || other.grappled
		this.restrained = this.restrained || other.restrained
		this.prone = this.prone || other.prone
		return this
	}
	get asArray(): Array<ConditionType> {
		const results: Array<ConditionType> = []
		if (this.grappled) results.push('grappled')
		if (this.restrained) results.push('restrained')
		if (this.prone) results.push('prone')
		return results
	}
}

class AttackResults {
	hits: AttackResultsHits = new AttackResultsHits()
	damage: AttackResultsDamage = new AttackResultsDamage()
	conditions: AttackResultsConditions = new AttackResultsConditions()
	add = (other: AttackResults): AttackResults => {
		this.hits.add(other.hits)
		this.damage.add(other.damage)
		this.conditions.add(other.conditions)
		return this
	}
}

class DamageInfo {
	count = observable<number>(0).extend({ numeric: 0 })
	sides = observable<number>(1).extend({ numeric: 0 })
	modifier = observable<number>(0).extend({ numeric: 0 })
	type = observable<DamageType>('bludgeoning')
}

class SaveInfo {
	attribute = observable<Attribute>('strength')
	dc = observable<number>(10).extend({ numeric: 0 })
}

class SaveModifiers {
	strength = observable<number>(0).extend({ numeric: 0 })
	dexterity = observable<number>(0).extend({ numeric: 0 })
	constitution = observable<number>(0).extend({ numeric: 0 })
	intelligence = observable<number>(0).extend({ numeric: 0 })
	wisdom = observable<number>(0).extend({ numeric: 0 })
	charisma = observable<number>(0).extend({ numeric: 0 })
}

class Effect {
	condition = observable<ConditionType>()
	save = observable<SaveInfo>()
	damage = observable<DamageInfo>()

	toggleCondition = () => {
		if (this.condition() === undefined) this.condition('grappled')
		else this.condition(undefined)
		return true
	}

	toggleSave = () => {
		if (this.save() === undefined) this.save(new SaveInfo())
		else this.save(undefined)
		return true
	}

	toggleDamage = () => {
		if (this.damage() === undefined) this.damage(new DamageInfo())
		else this.damage(undefined)
		return true
	}
}

class Creature {
	name: KnockoutObservable<string> = observable('unknown')
}

class Defender extends Creature {
	attackers = observableArray<Attacker>()
	attackDc = observable<number>(10).extend({ numeric: 0 })
	saveAdvantage = observable<Advantage>('normal')
	saveModifiers = observable<SaveModifiers>(new SaveModifiers())
}

class Attacker extends Creature {
	count = observable<number>(1).extend({ numeric: 0 })
	advantage = observable<Advantage>('normal')
	attackModifier = observable<number>(0).extend({ numeric: 0 })
	damage = observable<DamageInfo>(new DamageInfo())
	onHitEffect = observable<Effect>()

	toggleOnHitEffect = () => {
		if (this.onHitEffect() === undefined) this.onHitEffect(new Effect())
		else this.onHitEffect(undefined)
		return true
	}
}

class ViewModel {
	defenders = observableArray<Defender>()
	attackers = observableArray<Attacker>()
	selectedAttacker = observable<Attacker>()
	selectedDefender = observable<Defender>()
	results = observableArray<{ defender: string, results: AttackResults}>()

	/// rolling

	onRoll = () => {
		this.results.removeAll()
		for (let defender of this.defenders()) {
			const result = this.rollOneDefender(defender)
			this.results.push({ defender: defender.name(), results: result })
		}
	}

	private rollOneDefender = (defender: Defender): AttackResults => {
		const results = new AttackResults()
		for (let attacker of defender.attackers()) {
			results.add(this.rollOneAttacker(attacker, defender))
		}
		return results
	}

	private rollOneAttacker = (attacker: Attacker, defender: Defender): AttackResults => {
		const results = new AttackResults()
		for (let i = 0; i < attacker.count(); ++i) {
			const dieRoll = rollDie(20, attacker.advantage())
			const crit = dieRoll === 20
			const hit = !crit && dieRoll + attacker.attackModifier() >= defender.attackDc()
			const miss = !crit && !hit
			results.hits.add(new AttackResultsHits(crit ? 1 : 0, hit ? 1 : 0, miss ? 1 : 0))
			if (miss) continue
			if (attacker.onHitEffect()) {
				const { damage, conditions } = this.applyOnHitEffect(attacker.onHitEffect()!, defender)
				results.damage.add(damage)
				results.conditions.add(conditions)
			}
			results.damage.add(this.calculateDamage(attacker.damage(), crit))
		}
		return results
	}

	private applyOnHitEffect = (effect: Effect, defender: Defender): { damage: AttackResultsDamage, conditions: AttackResultsConditions } => {
		const result = { damage: new AttackResultsDamage(), conditions: new AttackResultsConditions() }
		const save = effect.save()
		if (save) {
			const dieRoll = rollDie(20, defender.saveAdvantage())
			const saveAttribute = save.attribute()
			const saveModifier = defender.saveModifiers()[saveAttribute]()
			if (dieRoll + saveModifier >= save.dc()) {
				// saved, if there is damage do half
				const damage = effect.damage()
				if (damage) {
					result.damage.add(this.calculateDamage(damage, false).half())
				}
				return result
			}
		}
		// either no save allowed or they failed the save, so full condition and damage
		const condition = effect.condition()
		if (condition) {
			result.conditions[condition] = true
		}

		const damage = effect.damage()
		if (damage) {
			result.damage.add(this.calculateDamage(damage, false))
		}

		return result
	}

	private calculateDamage = (damageInfo: DamageInfo, crit: boolean): AttackResultsDamage => {
		const results = new AttackResultsDamage()
		const dieCount = damageInfo.count() * (crit ? 2 : 1)
		let damageRolls = rollDice(dieCount, damageInfo.sides(), 'normal').reduce((total, roll) => total + roll, 0)
		const damage = damageRolls + damageInfo.modifier()
		results[damageInfo.type()] = damage
		return results
	}

	/// ui interactions

	onSelectDefender = (defender: Defender) => {
		this.selectedDefender(defender)
		this.selectedAttacker(undefined)
	}

	onSelectAttacker = (attacker: Attacker) => {
		this.selectedAttacker(attacker)
		this.selectedDefender(undefined)
	}

	onAddDefender = () => {
		this.defenders.push(new Defender())
	}

	onRemoveDefender = (defender: Defender) => {
		this.defenders.remove(defender)
		if (this.selectedDefender() === defender) this.selectedDefender(undefined)
		const attacker = defender.attackers().find(attacker => attacker === this.selectedAttacker())
		if (attacker !== undefined) this.selectedAttacker(undefined)
	}

	onAddAttacker = () => {
		this.attackers.push(new Attacker())
	}

	onRemoveAttacker = (attacker: Attacker) => {
		this.removeAttacker(attacker)
		if (this.selectedAttacker() === attacker) this.selectedAttacker(undefined)
	}

	onAttackerDroppedOnDefender = (attacker: Attacker, defender: Defender) => {
		this.removeAttacker(attacker)
		defender.attackers.push(attacker)
	}

	onAttackerDroppedOnUnusedList = (attacker: Attacker) => {
		this.removeAttacker(attacker)
		this.attackers.push(attacker)
	}

	/// drag and drop functionality

	onDragStart = (attacker: Attacker, dragEvent: DragEvent) => {
		dragEvent.dataTransfer!.setData("text", (dragEvent.target as HTMLElement).id)
		return true
	}

	onDragOver = (unused: any, dragEvent: DragEvent) => {
		const targetElement = dragEvent.currentTarget as HTMLElement
		targetElement.classList.add('drag-over')
		dragEvent.preventDefault()
		dragEvent.dataTransfer!.dropEffect = 'move'
		return true
	}

	onDragLeave = (unused: any, dragEvent: DragEvent) => {
		this.clearDragOver(dragEvent.currentTarget)
		dragEvent.preventDefault()
		return true
	}

	onDropOnDefender = (defender: Defender, dragEvent: DragEvent) => {
		this.clearDragOver(dragEvent.currentTarget)
		const attacker = dataFor(document.getElementById(dragEvent.dataTransfer!.getData('text'))) as Attacker
		dragEvent.preventDefault()
		this.onAttackerDroppedOnDefender(attacker, defender)
		return true
	}

	onDropOnAttackers = (usused: any, dragEvent: DragEvent) => {
		this.clearDragOver(dragEvent.currentTarget)
		const attacker = dataFor(document.getElementById(dragEvent.dataTransfer!.getData('text'))) as Attacker
		dragEvent.preventDefault()
		this.onAttackerDroppedOnUnusedList(attacker)
		return true
	}

	private clearDragOver = (eventTarget: EventTarget | null) => {
		const targetElement = eventTarget as HTMLElement
		targetElement.classList.remove('drag-over')
	}

	private removeAttacker = (attacker: Attacker) => {
		if (this.attackers.remove(attacker).length !== 0) return
		for (let defender of this.defenders()) {
			if (defender.attackers.remove(attacker).length !== 0) return
		}
		throw new Error(`unable to find attacker to remove them`)
	}
}

/// Knockout Setup

;(extenders as any).numeric = function(target: KnockoutObservable<number>, precision: number) {
	//create a writable computed observable to intercept writes to our observable
	const result = pureComputed({
		read: target,  //always return the original observables value
		write: newValue => {
			const current = target()
			const roundingMultiplier = Math.pow(10, precision)
			const newValueAsNum = isNaN(newValue) ? 0 : +newValue
			const valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier

			//only write if it changed
			if (valueToWrite !== current) {
				target(valueToWrite);
			} else {
				//if the rounded value is the same, but a different value was written, force a notification for the current field
				if (newValue !== current) {
					target.notifySubscribers(valueToWrite);
				}
			}
		}
	}).extend({ notify: 'always' })

	//initialize with current value to make sure it is rounded appropriately
	result(target())

	//return the new computed observable
	return result
}

let id = 0
;(bindingHandlers as any).uniqueId = {
	'init': (element: HTMLElement, valueAccessor: () => boolean) => {
		if (!valueAccessor()) return
		element.id = `unique-id-${++id}`
	}
}

applyBindings(new ViewModel())

/// Dice Helpers

function randomInt(min_inclusive: number, max_inclusive: number): number {
	min_inclusive = Math.ceil(min_inclusive)
	max_inclusive = Math.floor(max_inclusive)
	return Math.floor(Math.random() * (max_inclusive - min_inclusive + 1)) + min_inclusive
}

function rollDie(sides: number, advantage: Advantage): number {
	const first_roll = randomInt(1, sides)
	switch (advantage) {
		case 'advantage': return Math.max(first_roll, randomInt(1, sides))
		case 'normal': return first_roll
		case 'disadvantage': return Math.min(first_roll, randomInt(1, sides))
	}
}

function rollDice(count: number, sides: number, advantage: Advantage): Array<number> {
	const results = []
	for (let i = 0; i < count; ++i) {
		results.push(rollDie(sides, advantage))
	}
	return results
}
