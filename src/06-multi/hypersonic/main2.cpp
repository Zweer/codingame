#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <tuple>
#include <queue>
#include <functional>
using namespace std;

struct Player;
struct Radar;
struct Tile;
struct Bomb;
struct Item;
struct Revert;

const int BOMB_TIMER{ 8 };
int myId, w, h, maxBombs;
Player* p;
string* map;
Radar* r;
vector<Item*>* items;
vector<Bomb*>* bombs;
vector<Player*>* players;
Tile*** f;

int nX = { -1 };
int nY = { -1 };
string action;
int newBombTimer{ 0 };
bool start = true;
bool firstPlant = false;

enum class Type {
	player = 0,
	bomb = 1,
	item = 2
};

enum class IType {
	range = 1,
	bomb = 2
};

enum class Direction {
	right = 0,
	left = 1,
	top = 2,
	bottom = 3,
	all = 4,
	none = 5
};

struct Entity {
public:
	Type type;
	int owner; int x; int y;
	Entity(Type type, int owner, int x, int y) : type(type), owner(owner), x(x), y(y) {}
private:
	virtual void abstr() {}
};

struct Player : public Entity {
public:
	int nBombs, range, newBombIn;
	Player(Type type, int owner, int x, int y, int param1, int param2) : Entity(type, owner, x, y), nBombs(param1), range(param2) {
		if (owner == ::myId)
			::p = this;
		players->push_back(this);
	}
};

struct Bomb : public Entity {
public:
	int timer; int range;
	Bomb(Type type, int owner, int x, int y, int param1, int param2) : Entity(type, owner, x, y), timer(param1), range(param2) {
		bombs->push_back(this);
	}
};

struct Item : public Entity {
	IType iType;
	Item(Type type, int owner, int x, int y, int param1) : Entity(type, owner, x, y) {
		switch (param1) {
		case 1:
			iType = IType::range;
			break;
		case 2:
			iType = IType::bomb;
			break;
		}
		items->push_back(this);
	}
};

static void construct(int type, int owner, int x, int y, int param1, int param2) {
	switch (type) {
	case 0:
		new Player(Type::player, owner, x, y, param1, param2);
		break;
	case 1:
		new Bomb(Type::bomb, owner, x, y, param1, param2);
		break;
	case 2:
		new Item(Type::item, owner, x, y, param1);
		break;
	}
}

struct Tile {
	const int x, y;
	bool hasRangeItem{ false };
	bool hasBombItem{ false };
	bool hasItem{ false };
	bool hasBomb{ false };
	bool hasBox{ false };
	bool hasWall{ false };
	bool simulatedUnwalkable{ false };
	bool bombed{ false };
	bool bombOnX{ false };
	bool bombOnY{ false };
	bool spawned{ false };
	bool simulated{ false };
	Bomb* bomb{ nullptr };
	int explodesIn{ 0 };
	int points{ 0 };
	int distance{ 0 };
	vector<Tile*> boxedBombItems;
	vector<Tile*>* path;
	Direction bombLocation;
	vector<Bomb*>* targetBombs = new vector<Bomb*>;

	Tile* right{ nullptr };
	Tile* left{ nullptr };
	Tile* top{ nullptr };
	Tile* bottom{ nullptr };
	Tile* parent{ nullptr };

	Tile(int y, int x) : x(x), y(y) {}

	void linkTiles();
	void reset();
	void mark(char ch);
	void addItem(Item* it);
	void addBomb(Bomb* b, bool simulate = false);
	void calculatePoints();
	void setExplodeTime(int timer, int range, Direction direction, Bomb* bombe,bool simulate = false);
	bool isObstacle();
	bool isScoreableTile();
	bool isBoxOrWall();
	bool isWalkable();
	bool blocksExplosion();
	void setAsUnwalkable();
	void resetSimulatedUnwalkable();

private:
	void calculatePoints(int& points, int range, Direction direction, Tile* origin);
};

bool Tile::isObstacle() {
	return hasBomb || hasBox || hasWall || hasItem;
}

bool Tile::isScoreableTile() {
	return !hasBomb && !hasBox && !hasWall;
}

bool Tile::isBoxOrWall() {
	return hasBox || hasWall;
}

bool Tile::isWalkable() {
	return !hasBox && !hasWall && !hasBomb && !simulatedUnwalkable;
}

bool Tile::blocksExplosion() {
	return hasBox || hasWall || hasItem;
}

void Tile::setAsUnwalkable() {
	simulatedUnwalkable = true;
}

void Tile::resetSimulatedUnwalkable() {
	simulatedUnwalkable = false;
}

void Tile::linkTiles() {
	top = (y - 1 < 0) ? nullptr : f[y - 1][x];
	bottom = (y + 1 >= h) ? nullptr : f[y + 1][x];
	left = (x - 1 < 0) ? nullptr : f[y][x - 1];
	right = (x + 1 >= w) ? nullptr : f[y][x + 1];
}

void Tile::reset() {
	hasRangeItem = false;
	hasBombItem = false;
	hasItem = false;
	hasBomb = false;
	hasBox = false;
	hasWall = false;
	simulatedUnwalkable = false;
	bomb = nullptr;
	explodesIn = 0;
	points = 0;
	distance = 0;
	boxedBombItems.clear();
	path = nullptr;
	parent = nullptr;
	bombed = false;
	bombOnX = false;
	bombOnY = false;
	bombLocation = Direction::none;
	targetBombs->clear();
	spawned = false;
	simulated = false;
}

void Tile::addItem(Item* it) {
	if (it->iType == IType::bomb)
		hasBombItem = true;
	else hasRangeItem = true;
	hasItem = true;
}

void Tile::mark(char ch) {
	switch (ch) {
	case '0':
	case '1':
	case '2':
		hasBox = true;
		break;
	case 'X':
		hasWall = true;
		break;
	default:
		break;
	}
}

void Tile::addBomb(Bomb* b, bool simulate) {
	if (bomb == nullptr || b->range > bomb->range)
		bomb = b;
	hasBomb = true;
	setExplodeTime(b->timer, b->range, Direction::all, b, simulate);
	if(!simulate)
		map[b->y][b->x] = 'Z';
	else hasBomb = false;
}

void Tile::setExplodeTime(int timer, int range, Direction direction, Bomb* bombe, bool simulate) {
	bool duplicate = false;	
	for (int i = 0; i < targetBombs->size(); i++) {	
		if (targetBombs->at(i) == bombe) {
			duplicate = true;
			break;
		}
	}
	if (!duplicate)
		targetBombs->push_back(bombe);


	if (hasBomb) {
		if (timer == explodesIn && spawned)
			return;

		if (timer < explodesIn || explodesIn == 0)
			explodesIn = timer;

		range = bomb->range -1;		
		spawned = true;

		if (left != nullptr) left->setExplodeTime(explodesIn, range, Direction::left, bombe, simulate);
		if (top != nullptr) top->setExplodeTime(explodesIn, range, Direction::top, bombe, simulate);
		if (bottom != nullptr) bottom->setExplodeTime(explodesIn, range, Direction::bottom, bombe, simulate);
		if (right != nullptr) right->setExplodeTime(explodesIn, range, Direction::right, bombe, simulate);
	}
	else if (hasBox && !simulate) {
		bombed = true;
		map[y][x] = 'Y';
	}
	else if (blocksExplosion()) {
		if (timer < explodesIn || explodesIn == 0)
			explodesIn = timer;
	}
	else {
		if (timer < explodesIn || explodesIn == 0) {
			explodesIn = timer;
			if (simulate)
				simulated = true;
		}

		range--;
		if (range > 0) {
			switch (direction) {
			case Direction::left:
				if (left != nullptr) left->setExplodeTime(timer, range, Direction::left, bombe, simulate);
				break;
			case Direction::right:
				if (right != nullptr) right->setExplodeTime(timer, range, Direction::right, bombe, simulate);
				break;
			case Direction::top:
				if (top != nullptr) top->setExplodeTime(timer, range, Direction::top, bombe, simulate);
				break;
			case Direction::bottom:
				if (bottom != nullptr) bottom->setExplodeTime(timer, range, Direction::bottom, bombe, simulate);
			default:
				break;
			}
		}
	}
}

void Tile::calculatePoints() {
	if (!isScoreableTile())
		return;

	int range = p->range - 1;
	if (left != nullptr) left->calculatePoints(points, range, Direction::left, this);
	if (right != nullptr) right->calculatePoints(points, range, Direction::right, this);
	if (top != nullptr) top->calculatePoints(points, range, Direction::top, this);
	if (bottom != nullptr) bottom->calculatePoints(points, range, Direction::bottom, this);

	switch (points) {
	case 4:
		map[y][x] = 'A';
		break;
	case 3:
		map[y][x] = 'B';
		break;
	case 2:
		map[y][x] = 'C';
		break;
	case 1:
		map[y][x] = 'D';
	default:
		break;
	}
}

void Tile::calculatePoints(int& points, int range, Direction direction, Tile* origin) {
	range--;
	if (hasBox && !bombed) {
		points++;
		if (map[y][x] == '2')
			origin->boxedBombItems.push_back(this);
	}
	else if (hasBox && bombed) {
		switch (direction) {
		case Direction::left: {
			auto rt = this->right;
			while (rt != nullptr) {
				if (rt->hasBomb && rt->bomb->owner != myId) {
					points++;
					if (map[y][x] == '2')
						origin->boxedBombItems.push_back(this);
				}
				if (rt->isBoxOrWall())
					break;
				rt = rt->right;
			}			
		}
		break;
		case Direction::right: {
			auto lt = this->left;
			while (lt != nullptr) {
				if (lt->hasBomb && lt->bomb->owner != myId) {
					points++;
					if (map[y][x] == '2')
						origin->boxedBombItems.push_back(this);
				}
				if (lt->isBoxOrWall())
					break;
				lt = lt->left;
			}
		}
		break;
		case Direction::top: {
			auto bt = this->bottom;
			while (bt != nullptr) {
				if (bt->hasBomb && bt->bomb->owner != myId) {
					points++;
					if (map[y][x] == '2')
						origin->boxedBombItems.push_back(this);
				}
				if (bt->isBoxOrWall())
					break;
				bt = bt->bottom;
			}
		}
		break;
		case Direction::bottom: {
			auto tt = this->top;
			while (tt != nullptr) {
				if (tt->hasBomb && tt->bomb->owner != myId) {
					points++;
					if (map[y][x] == '2')
						origin->boxedBombItems.push_back(this);
				}
				if (tt->isBoxOrWall())
					break;
				tt = tt->top;
			}
		}
		break;		
		}		
	}
	else if (range > 0 && !isObstacle()) {
		switch (direction) {
		case Direction::left:
			if (left != nullptr) left->calculatePoints(points, range, Direction::left, origin);
			break;
		case Direction::right:
			if (right != nullptr) right->calculatePoints(points, range, Direction::right, origin);
			break;
		case Direction::top:
			if (top != nullptr) top->calculatePoints(points, range, Direction::top, origin);
			break;
		case Direction::bottom:
			if (bottom != nullptr) bottom->calculatePoints(points, range, Direction::bottom, origin);
		default:
			break;
		}
	}
}

struct Radar {
	void reset();
	void markMap();
	tuple<string, int, int> nextMove();
	int shortestPath(Tile* source, Tile* dest);
	vector<Tile*>* loadReachableSpots();
	void removeSuicidePlantTile(vector<Tile*>* tiles, vector<Tile*>* allTiles);
	bool isInExplosionRange(Tile* a, Tile* b);
	bool isObstacleBetween(Tile* a, Tile* b, int range); ;
	void sortLocations(vector<Tile*>* reachable);
	void removeExplosivePaths(vector<Tile*>* reachable);
	void removeAboutToExplodeTile(vector<Tile*>* reachable);
	bool canReachSaferTile(Tile* t);
	bool verifySecondChoicePlant(Tile* ct, Tile* dt, vector<Tile*>* reachable);
	bool simulatePlant(vector<Tile*>* reachable);
	Tile* saferTile();
};

void Radar::reset() {
	items->clear();
	players->clear();
	bombs->clear();
	for (int i = 0; i < h; i++) {
		for (int j = 0; j < w; j++)
			f[i][j]->reset();
	}
}

void Radar::markMap() {
	for (int i = 0; i < h; i++) {
		for (int j = 0; j < w; j++)
			f[i][j]->mark(map[i][j]);
	}

	for (auto& i : *items)
		f[i->y][i->x]->addItem(i);

	for (auto& b : *bombs)
		f[b->y][b->x]->addBomb(b);

	for (int i = 0; i < h; i++) {
		for (int j = 0; j < w; j++)
			f[i][j]->calculatePoints();
	}

	for (auto& p : *players) {
		p->newBombIn = 0;
		vector<Bomb*> bs;
		for (auto& b : *bombs)
			if (b->owner == p->owner)
				bs.push_back(b);

		auto min_it = min_element(bs.begin(), bs.end(), [](const Bomb* lhs, const Bomb* rhs) {
			return lhs->timer < rhs->timer;
		});

		if (min_it != bs.end()) {
			auto b = *min_it;
			p->newBombIn = b->timer;
		}

		if (p->owner == myId) {
			cerr << "NEW BOMB IN: " << p->newBombIn << endl;
			newBombTimer = p->newBombIn;
		}
	}
}

int Radar::shortestPath(Tile* source, Tile* dest) {
	queue<Tile*> q;
	int moves = 0;
	int nodesLeft = 1;
	int nodesNext = 0;
	bool reached = false;
	bool** visited = new bool*[h];
	for (int i = 0; i < h; i++)
		visited[i] = new bool[w] {false};

	int dv[2][4] = { {-1,+1,0,0}, {0,0,+1,-1} };
	q.push(source);
	auto path = new vector<Tile*>;

	visited[source->y][source->x] = true;

	auto explore = [&](int y, int x) {
		auto parent = f[y][x];
		for (int i = 0; i < 4; i++) {
			int yy = y + dv[0][i];
			int xx = x + dv[1][i];

			if (yy < 0 || yy >= h) continue;
			if (xx < 0 || xx >= w) continue;

			if (visited[yy][xx]) continue;
			if (!f[yy][xx]->isWalkable()) continue;

			f[yy][xx]->parent = parent;
			q.push(f[yy][xx]);
			visited[yy][xx] = true;
			nodesNext++;
		}
	};

	while (q.size() > 0) {
		Tile* t = q.front(); q.pop();

		if (t == dest) {
			reached = true;
			t->path = path;
			while (t->parent != nullptr) {
				path->push_back(t);
				t = t->parent;
			}
			reverse(path->begin(), path->end());
			break;
		}

		explore(t->y, t->x);
		nodesLeft--;
		if (nodesLeft == 0) {
			nodesLeft = nodesNext;
			nodesNext = 0;
			moves++;
		}
	}

	if (reached) {
		dest->path = path;
		return moves;
	}
	return -1;
}

vector<Tile*>* Radar::loadReachableSpots() {
	auto reachable = new vector<Tile*>;
	for (int i = 0; i < h; i++) {
		for (int j = 0; j < w; j++) {
			auto t = f[i][j];
			if (!t->isWalkable())
				continue;
			t->distance = shortestPath(f[p->y][p->x], t);
			if (t->distance >= 0 && canReachSaferTile(t))
				reachable->push_back(t);
		}
	}

	return reachable;
}

bool Radar::isObstacleBetween(Tile* a, Tile* b, int range) {
	if (a->x == b->x) {
		int s = (a->y < b->y) ? a->y : b->y;
		for (int i = s + 1; i < range; i++)
			if (f[i][a->x]->isBoxOrWall())
				return true;
	}
	else if (a->y == b->y) {
		int s = (a->x < b->x) ? a->x : b->x;
		for (int i = s + 1; i < range; i++)
			if (f[a->y][i]->isBoxOrWall())
				return true;
	}

	return false;
}

bool Radar::isInExplosionRange(Tile* a, Tile* b) {
	if (a->x == b->x) {
		int dist = abs(b->y - a->y);
		if (dist < p->range && !isObstacleBetween(a, b, dist))
			return true;
		return false;
	}
	if (a->y == b->y) {
		int dist = abs(b->x - a->x);
		if (dist < p->range && !isObstacleBetween(a, b, dist))
			return true;
		return false;
	}
}

void Radar::removeSuicidePlantTile(vector<Tile*>* tiles, vector<Tile*>* allTiles) {
	for (int i = 0; i < tiles->size(); i++) {
		auto bt = tiles->at(i);
		if (bt->explodesIn <= newBombTimer && newBombTimer > 0 && bt->explodesIn > 0) {
			tiles->erase(tiles->begin() + i--);
			continue;
		}

		if (bt->explodesIn <= 4 && bt->explodesIn > 0) {
			tiles->erase(tiles->begin() + i--);
			continue;
		}

		auto it = find_if(tiles->begin(), tiles->end(), [&](Tile* t) {
			if (bt == t)
				return false;


			if (t->y != bt->y && t->x != bt->x)
				return true;

			if (isInExplosionRange(bt, t)) {
				auto it = find_if(tiles->begin(), tiles->end(), [&](Tile* t2) {
					if (t2->explodesIn == 0)
						return false;

					if (t2 == t || t2 == bt)
						return false;

					if (t2->explodesIn <= 5)
						return true;
				});

				if(it == tiles->end())
					return false;
				return true;
			}

			return true;
		});
		if (it == tiles->end())
			tiles->erase(tiles->begin() + i--);
	}
}

void Radar::sortLocations(vector<Tile*>* reachable) {
	if (reachable->empty() || reachable->size() == 1) return;
	sort(reachable->begin(), reachable->end(), [&](const Tile* lhs, const Tile* rhs) {
		if (lhs->distance <= 2 && lhs->hasItem && maxBombs <= 3)
			return true;
		if (rhs->distance <= 2 && rhs->hasItem && maxBombs <= 3)
			return false;

		if (p->nBombs == 0) {
			if (lhs->distance < newBombTimer && lhs->points > rhs->points)
				return true;
			if (rhs->distance < newBombTimer && rhs->points > lhs->points)
				return false;
		}

		int lhsScore, rhsScore;
		if (lhs->points == 0)
			lhsScore = -100;
		else lhsScore = lhs->points - lhs->distance;

		if (rhs->points == 0)
			rhsScore = -100;
		else rhsScore = rhs->points - rhs->distance;

		if(lhsScore == -100 && rhsScore == -100)
			return lhs->distance < rhs->distance;

		return lhsScore > rhsScore;
	});
}

bool Radar::canReachSaferTile(Tile* t) {
	if (t->explodesIn == 0)
		return true;

	int x = t->x;
	int y = t->y;
	int dv[2][4] = { {-1,+1,0,0}, {0,0,+1,-1} };
	for (int i = 0; i < 4; i++) {
		int yy = y + dv[0][i];
		int xx = x + dv[1][i];

		if (yy < 0 || yy >= h) continue;
		if (xx < 0 || xx >= w) continue;

		if (!f[yy][xx]->isWalkable()) continue;

		auto t2 = f[yy][xx];
		int timer = t2->explodesIn;		
		if ((timer == 0 || timer > t->explodesIn + 2))
			return true;	
			
	}
	return false;
}

Tile* Radar::saferTile() {
	int x = p->x;
	int y = p->y;
	auto ct = f[y][x];
	if (ct->explodesIn == 0)
		return nullptr;
	int dv[2][4] = { {-1,+1,0,0}, {0,0,+1,-1} };
	for (int i = 0; i < 4; i++) {
		int yy = y + dv[0][i];
		int xx = x + dv[1][i];

		if (yy < 0 || yy >= h) continue;
		if (xx < 0 || xx >= w) continue;

		if (!f[yy][xx]->isWalkable()) continue;

		cerr << "checking: " << xx << " " << yy <<" "<< f[yy][xx]->explodesIn<< endl;

		auto t2 = f[yy][xx];
		int timer = t2->explodesIn;
		if (timer == 0 || timer >= ct->explodesIn + 3) {
			cerr<<"SAFER "<<t2->explodesIn<<" - "<<ct->explodesIn<<endl;
			return t2;
		}
	}

	for (int i = 0; i < 4; i++) {
		int yy = y + dv[0][i];
		int xx = x + dv[1][i];

		if (yy < 0 || yy >= h) continue;
		if (xx < 0 || xx >= w) continue;

		if (!f[yy][xx]->isWalkable()) continue;

		cerr << "checking: " << xx << " " << yy << " " << f[yy][xx]->explodesIn << endl;

		auto t2 = f[yy][xx];
		int timer = t2->explodesIn;
		if (timer > ct->explodesIn || timer <= 3 && t2->simulated) {
			cerr << "SAFER " << t2->explodesIn << " - " << ct->explodesIn << endl;
			return t2;
		}
	}

	return nullptr;
}

void Radar::removeExplosivePaths(vector<Tile*>* reachable) {
	for (int i = 0; i < reachable->size(); i++) {
		auto dt = reachable->at(i);
		//cerr << "CHECKING " << dt->x << " " << dt->y << endl;
		if (dt->path->empty() && dt->explodesIn <= 2 && dt->explodesIn > 0) {
			reachable->erase(reachable->begin() + i--);
			continue;
		}
		int v = dt->explodesIn - dt->distance;
		if (v >= 1 && v<=3 ) {
			reachable->erase(reachable->begin() + i--);
			continue;
		}

		/*if (!dt->path->empty() && dt->path->at(0)->explodesIn <= 3 && dt->path->at(0)->explodesIn > 0) {
			auto t = dt->path->at(0);
			reachable->erase(reachable->begin() + i--);
		}*/

		bool itemOnWay = false;
		int ix, iy;
		int itemExplodesIn;
		vector<Bomb*>* targets;
		for (int j = 0; j < dt->path->size(); j++) {
			auto t = dt->path->at(j);
			//cerr <<t->x << " " << t->y << " "<<t->explodesIn<<endl;
			if (t->explodesIn == 0 && !itemOnWay)
				continue;
			if (t->hasItem) {
				itemOnWay = true;
				itemExplodesIn = t->explodesIn;
				ix = t->x; iy = t->y;
				targets = t->targetBombs;
			}
			
			if (t->explodesIn < j+1 && t->targetBombs->size() == 1)
				continue;
			if (t->explodesIn <= 2 + j) {
				reachable->erase(reachable->begin() + i--);
				break;
			}

			if (itemOnWay && ((t->x == ix || t->y == iy) && !(t->x == ix && t->y == iy))) {
				cerr<<"ITEM on the way.. "<<t->x<<" "<<t->y<<endl;
				bool willExplode = false;
				for (auto& b : *targets) {
					if (b->x == t->x) {
						if (abs(t->x - b->x) <= b->range) {
							willExplode = true;
							break;
						}
					}
					if (b->y == t->y) {
						if (abs(t->y - b->y) <= b->range) {
							willExplode = true;
							break;
						}
					}
				}

				if (willExplode && itemExplodesIn <= 2 + j) {
					cerr<<"ITEM SHIELDED: "<<t->x<<" "<<t->y<<endl;
					reachable->erase(reachable->begin() + i--);
					break;
				}
			}

		}
	}
	for (int i = 0; i < reachable->size(); i++) {
		auto nt = reachable->at(i);
		if (nt->path->empty() || nt->explodesIn == 0)
			continue;
		if (!canReachSaferTile(nt))
			reachable->erase(reachable->begin() + i--);
	}
}

void Radar::removeAboutToExplodeTile(vector<Tile*>* reachable) {
	for (int i = 0; i < reachable->size(); i++) {
		auto t = reachable->at(i);
		if (t->explodesIn > 0 && t->explodesIn <=4 && t->distance <= t->explodesIn)
			reachable->erase(reachable->begin() + i--);
	}
}

bool Radar::verifySecondChoicePlant(Tile* ct, Tile* dt, vector<Tile*>* reachable) {
	cerr << "verify second choice plant" << endl;
	ct->setAsUnwalkable();
	for (int i = 0; i < reachable->size(); i++) {
		auto t = reachable->at(i);
		if (t == ct || t == dt) continue;
		if (t->x != dt->x && t->y != dt->y) {
			auto mem = t->path;
			int di = shortestPath(dt, t);
			t->path = mem;
			if (di > 0) return true;
		}
	}
	return false;
}

bool Radar::simulatePlant(vector<Tile*>* reachable) {
	auto dest = new vector<Tile*>(reachable->size());
	copy(reachable->begin(), reachable->end(), dest->begin());
	cerr << "simulating plant" << endl;
	f[p->y][p->x]->addBomb(new Bomb(Type::bomb, myId, p->x, p->y, 8, p->range));
	for (auto& t : *dest) {
		t->calculatePoints();
	}
	removeExplosivePaths(dest);
	removeSuicidePlantTile(dest, reachable);
	sortLocations(dest);

	cerr << endl;
	
	cerr << "----------------------------" << endl;
	for (auto& r : *dest)
		cerr << r->x << " " << r->y << " PTS: " << r->points << " DIST: " << r->distance << " +BOMBS: " << r->boxedBombItems.size() << " PATH SIZE: " << r->path->size() << " Explodes in: " << r->explodesIn << endl;
	cerr << "----------------------------" << endl;
	cerr << endl;

	if (dest->size() <= 1)
		return false;

	bool noExpld = false;
	for (int i = 1; i < dest->size(); i++) {
		if (dest->at(i)->path != nullptr && !dest->at(i)->path->empty() && dest->at(i)->explodesIn == 0) {
			nX = dest->at(i)->path->at(0)->x;
			nY = dest->at(i)->path->at(0)->y;
			noExpld = true;
			break;
		}
	}
	if (!noExpld) {
		for (int i = 0; i < dest->size(); i++) {
			if(dest->at(i)->explodesIn > 0 && dest->at(i)->explodesIn <= dest->at(0)->explodesIn)
				dest->erase(dest->begin() + i);
		}
		if (dest->size() == 1) {
			nX = p->x;
			nY = p->y;
		}
		else {
			nX = dest->at(1)->x;
			nY = dest->at(1)->y;
		}
	}
	return true;
}

tuple<string, int, int> Radar::nextMove() {
	for (auto& p2 : *players) {
		if (p2->owner != myId) {
			int distance = shortestPath(f[p->y][p->x], f[p2->y][p2->x]);
			if (distance != -1 &&  distance <= 4) {
				if (p2->nBombs > 0 || p2->newBombIn == 1) {
					f[p2->y][p2->x]->addBomb(new Bomb(Type::bomb, p2->owner, p2->x, p2->y, 8, p2->range), true);
					cerr << "adding bomb: " << p2->x << " " << p2->y << endl;
				}
			}
		}
	}

	auto reachable = loadReachableSpots();

	/*cerr << "original: " << reachable->size() << endl;
	cerr << "----------------------------" << endl;
	for (auto& r : *reachable)
		cerr << r->x << " " << r->y << " PTS: " << r->points << " DIST: " << r->distance << " +BOMBS: " << r->boxedBombItems.size() << " PATH SIZE: " << r->path->size()<<"EXPL IN: "<<r->explodesIn << endl;
	cerr << "----------------------------" << endl;*/

	auto dest = new vector<Tile*>(reachable->size());
	copy(reachable->begin(), reachable->end(), dest->begin());
	removeExplosivePaths(dest);
	cerr << "no explosive paths: " << dest->size() << endl;
	sortLocations(dest);
	cerr << "sorted: " << dest->size() << endl;

	if (p->nBombs)
		removeSuicidePlantTile(dest, reachable);
	else removeAboutToExplodeTile(dest);

	cerr << "no suicide: " << dest->size() << endl;
	cerr << "----------------------------" << endl;
	for (auto& r : *dest)
		cerr << r->x << " " << r->y << " PTS: " << r->points << " DIST: " << r->distance << " +BOMBS: " << r->boxedBombItems.size() << " PATH SIZE: " << r->path->size() << " Explodes in: "<<r->explodesIn<<endl;
	cerr << "----------------------------" << endl;

	auto ct = f[p->y][p->x];

	if (!dest->empty()) {
		nX = dest->at(0)->x;
		nY = dest->at(0)->y;
	}
	else {
		if (ct->explodesIn > 0) {
			dest = new vector<Tile*>(reachable->size());
			copy(reachable->begin(), reachable->end(), dest->begin());
			removeExplosivePaths(dest);
			sortLocations(dest);
			removeAboutToExplodeTile(dest);

			cerr << "hmmm" << endl;
			cerr << "----------------------------" << endl;
			for (auto& r : *dest)
				cerr << r->x << " " << r->y << " PTS: " << r->points << " DIST: " << r->distance << " +BOMBS: " << r->boxedBombItems.size() << " PATH SIZE: " << r->path->size() << endl;
			cerr << "----------------------------" << endl;

			for (int i = 0; i < dest->size(); i++) {
				if (dest->at(i)->explodesIn < ct->explodesIn && dest->at(i)->explodesIn > 0 && dest->at(i)->explodesIn >= dest->at(i)->distance)
					dest->erase(dest->begin() + i--);
			}

			cerr << "hmmm" << endl;
			cerr << "----------------------------" << endl;
			for (auto& r : *dest)
				cerr << r->x << " " << r->y << " PTS: " << r->points << " DIST: " << r->distance << " +BOMBS: " << r->boxedBombItems.size() << " PATH SIZE: " << r->path->size() << endl;
			cerr << "----------------------------" << endl;


			if (!dest->empty()) {
				nX = dest->at(0)->x;
				nY = dest->at(0)->y;
			}
			else {
				Tile* safer = nullptr;
				if (ct->explodesIn > 0)
					safer = saferTile();

				if (safer != nullptr) {
					cerr << "GO SAFER: " << safer->x << " " << safer->y << endl;
					nX = safer->x;
					nY = safer->y;
				}
				else {
					nX = p->x;
					nY = p->y;
				}
			}
		}
		else {
			nX = p->x;
			nY = p->y;
		}
	}
	auto t = f[nY][nX];

	if (t->parent != nullptr) {
		cerr << "PATH for: " << t->x << " " << t->y << endl;
		for (auto& p : *t->path) {
			cerr << p->x << " " << p->y << " " << p->explodesIn << endl;
		}
	}
	cerr << ct->x<<" "<<ct->y<<" "<<ct->points << endl;

	bool secondChoice = ((ct->explodesIn == 0 || ct->explodesIn >= 4) && p->nBombs > 0);
	bool firstChoice = (p->nBombs > 0 && ct->points > 0 && ((!dest->empty() && t->distance == 0)));
	if (p->nBombs > 0 && ct->points > 0 && ((!dest->empty() && t->distance == 0) || (secondChoice && !t->path->empty()))) {
		if (!firstChoice && secondChoice) {
			if (verifySecondChoicePlant(ct, t->path->at(0), dest) && simulatePlant(reachable))
				action = "BOMB";
			else action = "MOVE";
		}
		else if (simulatePlant(reachable))
			action = "BOMB";
		else action = "MOVE";
	}
	else action = "MOVE";

	int x, y;
	if (t->path != nullptr && !t->path->empty()) {
		x = t->path->at(0)->x;
		y = t->path->at(0)->y;
	}
	else {
		x = nX;
		y = nY;
	}

	return make_tuple(action, x, y);
}

int main()
{
	Radar radar; ::r = &radar;
	vector<Item*> items; ::items = &items;
	vector<Bomb*> bombs; ::bombs = &bombs;
	vector<Player*> players; ::players = &players;

	cin >> ::w >> ::h >> ::myId; cin.ignore();

	map = new string[h];
	f = new Tile**[h];
	for (int i = 0; i < h; i++) {
		f[i] = new Tile*[w];
		for (int j = 0; j < w; j++)
			f[i][j] = new Tile(i, j);
	}

	for (int i = 0; i < h; i++) {
		for (int j = 0; j < w; j++)
			f[i][j]->linkTiles();
	}

	while (1) {
		radar.reset();
		for (int i = 0; i < h; i++)
			cin >> map[i]; cin.ignore();

		int N; cin >> N; cin.ignore();
		for (int i = 0; i < N; i++) {
			int type, owner, x, y, param1, param2;
			cin >> type >> owner >> x >> y >> param1 >> param2; cin.ignore();
			construct(type, owner, x, y, param1, param2);
		}

		cerr << "MY POS: " << p->x << " " << p->y << " MY RANGE " << p->range << endl;
		if (p->nBombs > maxBombs) {
			maxBombs = p->nBombs;
		}
		radar.markMap();

		/*for (int i = 0; i < h; i++) {
			for (int j = 0; j < w; j++) {
				auto t = f[i][j];
				if (t->explodesIn > 0)
					cerr << t->x << " " << t->y << " " << t->explodesIn << endl;
			}
		}

		for (int i = 0; i < h; i++)
			cerr << map[i] << endl;

		cerr << endl;
		for (auto& p : players ) {
			cerr << p->x << " " << p->y << " " << p->range << endl;
		}
		cerr << endl;
		for (auto& b : bombs) {
			cerr << b->x << " " << b->y << " " << b->range << endl;
		}*/

		auto ct = f[p->y][p->x];
		cerr << ct->x << " " << ct->y << " EXPLODES IN: " << ct->explodesIn << endl;
		tuple<string, int, int> result = radar.nextMove();
		std::cout << get<0>(result) << " " << get<1>(result) << " " << get<2>(result) << endl;
	}
}
