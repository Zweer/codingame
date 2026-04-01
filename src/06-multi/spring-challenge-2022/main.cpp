#pragma GCC optimize("O3")
#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <string>
using namespace std;

struct V {
    double x, y;
    V(double x=0,double y=0):x(x),y(y){}
    V operator-(V o)const{return{x-o.x,y-o.y};}
    V operator+(V o)const{return{x+o.x,y+o.y};}
    V operator*(double s)const{return{x*s,y*s};}
    double len()const{return sqrt(x*x+y*y);}
    double dist(V o)const{return(*this-o).len();}
    V norm()const{double l=len();return l>0?V{x/l,y/l}:V{0,0};}
};

const double HERO_SPEED = 800;
const double MON_SPEED = 400;
const double BASE_KILL = 300;
const double BASE_ATTRACT = 5000;
const double BASE_VIEW = 6000;
const double WIND_RANGE = 1280;
const double WIND_PUSH = 2200;
const double SPELL_RANGE = 2200;
const double MAP_X = 17630;
const double MAP_Y = 9000;

V myBase, enemyBase;
int myHP, myMana, enemyHP, enemyMana;
int turn = 0;

struct Entity {
    int id, type;
    V pos;
    int shieldLife, isControlled;
    int health;
    V vel;
    int nearBase, threatFor;
};

int turnsToHit(V pos, V vel, int nearBase, int threatFor, V base) {
    for (int t = 1; t <= 200; t++) {
        if (nearBase && threatFor != 0)
            pos = pos + (base - pos).norm() * MON_SPEED;
        else {
            pos = pos + vel;
            if (pos.dist(base) <= BASE_ATTRACT) { nearBase = 1; threatFor = 1; }
        }
        if (pos.dist(base) <= BASE_KILL) return t;
    }
    return 999;
}

V monPosAt(V pos, V vel, int nearBase, int threatFor, V base, int t) {
    for (int i = 0; i < t; i++) {
        if (nearBase && threatFor != 0)
            pos = pos + (base - pos).norm() * MON_SPEED;
        else {
            pos = pos + vel;
            if (pos.dist(base) <= BASE_ATTRACT) { nearBase = 1; threatFor = 1; }
        }
    }
    return pos;
}

int interceptTurn(V hpos, V mpos, V mvel, int nb, int tf, V base) {
    for (int t = 1; t <= 30; t++) {
        V mp = monPosAt(mpos, mvel, nb, tf, base, t);
        if (ceil(hpos.dist(mp) / HERO_SPEED) <= t) return t;
    }
    return 30;
}

int main() {
    int bx, by;
    cin >> bx >> by;
    myBase = {(double)bx, (double)by};
    enemyBase = {bx == 0 ? MAP_X : 0.0, by == 0 ? MAP_Y : 0.0};

    int heroesPerPlayer;
    cin >> heroesPerPlayer;

    double s = (myBase.x == 0) ? 1.0 : -1.0;

    V defPatrol[2] = {
        myBase + V{s * 5500, 2500},
        myBase + V{s * 2500, 5500},
    };

    V atkFarmSpot = V{MAP_X * 0.5 + s * MAP_X * 0.25, MAP_Y * 0.5};
    V atkCamp = enemyBase + V{-s * 5000, -s * 2000};

    while (true) {
        turn++;
        cin >> myHP >> myMana >> enemyHP >> enemyMana;

        int n;
        cin >> n;

        vector<Entity> heroes, enemies, monsters;
        for (int i = 0; i < n; i++) {
            Entity e;
            cin >> e.id >> e.type >> e.pos.x >> e.pos.y
                >> e.shieldLife >> e.isControlled
                >> e.health >> e.vel.x >> e.vel.y >> e.nearBase >> e.threatFor;
            if (e.type == 0) monsters.push_back(e);
            else if (e.type == 1) heroes.push_back(e);
            else enemies.push_back(e);
        }
        sort(heroes.begin(), heroes.end(), [](auto& a, auto& b){ return a.id < b.id; });

        string cmd[3];
        bool used[3] = {};
        bool monTaken[500] = {};

        // ==============================================================
        // DEFENSE (heroes 0 & 1)
        // ==============================================================

        struct Threat {
            int idx;
            int ttb;
            double distBase;
            bool targeting;
        };
        vector<Threat> threats;
        for (int i = 0; i < (int)monsters.size(); i++) {
            auto& m = monsters[i];
            double db = m.pos.dist(myBase);
            bool tgt = (m.nearBase == 1 && m.threatFor == 1);
            bool will = (m.threatFor == 1);
            int ttb = turnsToHit(m.pos, m.vel, m.nearBase, tgt ? 1 : 0, myBase);
            if (tgt || will || db < 8000)
                threats.push_back({i, ttb, db, tgt});
        }
        sort(threats.begin(), threats.end(), [](auto& a, auto& b){
            if (a.targeting != b.targeting) return a.targeting > b.targeting;
            return a.ttb < b.ttb;
        });

        // --- WIND: multi-monster or close monster (both defenders can wind!) ---
        for (int h = 0; h < 2; h++) {
            if (used[h] || myMana < 10) continue;
            int windCount = 0;
            bool hasClose = false;
            for (auto& m : monsters) {
                bool tgt = (m.nearBase == 1 && m.threatFor == 1);
                if (!tgt && m.threatFor != 1) continue;
                if (heroes[h].pos.dist(m.pos) > WIND_RANGE) continue;
                if (m.shieldLife > 0) continue;
                windCount++;
                if (m.pos.dist(myBase) < 4000) hasClose = true;
            }
            if (windCount >= 2 || hasClose) {
                cmd[h] = "SPELL WIND " + to_string((int)enemyBase.x) + " " + to_string((int)enemyBase.y) + " WIND!";
                myMana -= 10;
                used[h] = true;
            }
        }

        // --- CONTROL enemy heroes near our base ---
        for (int h = 0; h < 2; h++) {
            if (used[h] || myMana < 10) continue;
            for (auto& e : enemies) {
                if (e.pos.dist(myBase) < BASE_VIEW
                    && heroes[h].pos.dist(e.pos) <= SPELL_RANGE
                    && e.shieldLife == 0) {
                    cmd[h] = "SPELL CONTROL " + to_string(e.id) + " "
                        + to_string((int)enemyBase.x) + " " + to_string((int)enemyBase.y) + " GTFO";
                    myMana -= 10;
                    used[h] = true;
                    break;
                }
            }
        }

        // --- Assign defenders to threats ---
        for (auto& d : threats) {
            auto& m = monsters[d.idx];
            int bestH = -1;
            int bestIT = 999;
            double bestDist = 1e18;
            for (int h = 0; h < 2; h++) {
                if (used[h]) continue;
                int it = interceptTurn(heroes[h].pos, m.pos, m.vel,
                    m.nearBase, d.targeting ? 1 : 0, myBase);
                double dist = heroes[h].pos.dist(m.pos);
                if (it < bestIT || (it == bestIT && dist < bestDist)) {
                    bestIT = it; bestDist = dist; bestH = h;
                }
            }
            if (bestH < 0) continue;
            if (bestIT > d.ttb + 2) continue;

            V target = monPosAt(m.pos, m.vel, m.nearBase, d.targeting ? 1 : 0, myBase, bestIT);
            cmd[bestH] = "MOVE " + to_string((int)target.x) + " " + to_string((int)target.y);
            used[bestH] = true;
            monTaken[d.idx] = true;
        }

        // --- Idle defenders: emergency recall, farm, or patrol ---
        // Check if there's an urgent threat that wasn't assigned (both defenders were busy)
        bool baseUnderAttack = false;
        for (auto& d : threats) {
            if (d.targeting && d.distBase < 5000 && d.ttb < 8) { baseUnderAttack = true; break; }
        }

        for (int h = 0; h < 2; h++) {
            if (used[h]) continue;

            // Emergency recall: if base is under attack, rush to intercept closest threat
            if (baseUnderAttack) {
                int bestM = -1; double bestD = 1e18;
                for (auto& d : threats) {
                    if (!d.targeting) continue;
                    auto& m = monsters[d.idx];
                    double dist = heroes[h].pos.dist(m.pos);
                    if (dist < bestD) { bestD = dist; bestM = d.idx; }
                }
                if (bestM >= 0) {
                    auto& m = monsters[bestM];
                    V target = monPosAt(m.pos, m.vel, m.nearBase, 1, myBase, 1);
                    cmd[h] = "MOVE " + to_string((int)target.x) + " " + to_string((int)target.y) + " RUSH";
                    used[h] = true;
                    continue;
                }
            }

            // SELF-SHIELD only when idle (no urgent threats) and enemy is near base
            bool enemyNearBase = false;
            for (auto& e : enemies) {
                if (e.pos.dist(myBase) < 7000) { enemyNearBase = true; break; }
            }
            if (enemyNearBase && myMana >= 30
                && heroes[h].shieldLife == 0
                && heroes[h].pos.dist(myBase) < 7000) {
                cmd[h] = "SPELL SHIELD " + to_string(heroes[h].id) + " SELF-SHIELD";
                myMana -= 10;
                used[h] = true;
                continue;
            }

            // Farm: chase monsters within range, prefer closer ones
            int bestM = -1; double bestD = 1e18;
            for (int i = 0; i < (int)monsters.size(); i++) {
                if (monTaken[i]) continue;
                auto& m = monsters[i];
                double d = heroes[h].pos.dist(m.pos);
                double db = m.pos.dist(myBase);
                if (db > 10000) continue; // don't chase too far from base
                if (d < bestD) { bestD = d; bestM = i; }
            }
            if (bestM >= 0 && bestD < 7000) {
                auto& m = monsters[bestM];
                cmd[h] = "MOVE " + to_string((int)(m.pos.x + m.vel.x)) + " " + to_string((int)(m.pos.y + m.vel.y)) + " farm";
                monTaken[bestM] = true;
            } else {
                // No monsters nearby: roam toward mid-map to find monsters sooner
                V farmRoam = myBase + V{s * 7000, (h == 0) ? 3500.0 : 5000.0};
                if (heroes[h].pos.dist(farmRoam) < 800) {
                    // Already at roam point, go to patrol
                    cmd[h] = "MOVE " + to_string((int)defPatrol[h].x) + " " + to_string((int)defPatrol[h].y) + " patrol";
                } else {
                    cmd[h] = "MOVE " + to_string((int)farmRoam.x) + " " + to_string((int)farmRoam.y) + " roam";
                }
            }
            used[h] = true;
        }

        // ==============================================================
        // ATTACK (hero 2)
        // ==============================================================
        int a = 2;
        bool acted = false;

        bool earlyGame = (turn < 25 || myMana < 15);
        double atkDistToEnemy = heroes[a].pos.dist(enemyBase);

        if (!earlyGame) {
            // --- SHIELD self only when enemy hero is close ---
            if (!acted && myMana >= 10
                && heroes[a].shieldLife == 0
                && atkDistToEnemy < 8000) {
                bool enemyClose = false;
                for (auto& e : enemies) {
                    if (e.pos.dist(heroes[a].pos) < 2500) { enemyClose = true; break; }
                }
                if (enemyClose) {
                    cmd[a] = "SPELL SHIELD " + to_string(heroes[a].id) + " ATK-SELF-SHIELD";
                    myMana -= 10;
                    acted = true;
                }
            }

            // --- WIND: push monsters near enemy base ---
            if (!acted && myMana >= 10) {
                int windableCount = 0;
                int bestM = -1; double bestDE = 1e18;
                for (int i = 0; i < (int)monsters.size(); i++) {
                    auto& m = monsters[i];
                    if (heroes[a].pos.dist(m.pos) > WIND_RANGE) continue;
                    if (m.shieldLife > 0) continue;
                    double de = m.pos.dist(enemyBase);
                    if (de < 7000) {
                        windableCount++;
                        if (de < bestDE) { bestDE = de; bestM = i; }
                    }
                }
                if (bestM >= 0 && (windableCount >= 2 || bestDE < 5500)) {
                    cmd[a] = "SPELL WIND " + to_string((int)enemyBase.x) + " " + to_string((int)enemyBase.y) + " ATK-WIND";
                    myMana -= 10;
                    acted = true;
                }
            }

            // --- SHIELD monsters heading to enemy base (high HP) ---
            if (!acted && myMana >= 20) {
                for (auto& m : monsters) {
                    if (m.nearBase == 1 && m.threatFor == 2
                        && m.shieldLife == 0 && m.health >= 12
                        && m.pos.dist(enemyBase) < 5000
                        && heroes[a].pos.dist(m.pos) <= SPELL_RANGE) {
                        cmd[a] = "SPELL SHIELD " + to_string(m.id) + " ATK-SHIELD";
                        myMana -= 10;
                        acted = true;
                        break;
                    }
                }
            }

            // --- CONTROL: high-HP monsters close to enemy base ---
            if (!acted && myMana >= 20) {
                int bestM = -1; int bestHP = 0;
                for (int i = 0; i < (int)monsters.size(); i++) {
                    auto& m = monsters[i];
                    if (heroes[a].pos.dist(m.pos) > SPELL_RANGE) continue;
                    if (m.shieldLife > 0) continue;
                    if (m.nearBase == 1 && m.threatFor == 2) continue;
                    double de = m.pos.dist(enemyBase);
                    if (m.health > bestHP && de < 7000) { bestHP = m.health; bestM = i; }
                }
                if (bestM >= 0 && bestHP >= 12) {
                    cmd[a] = "SPELL CONTROL " + to_string(monsters[bestM].id) + " "
                        + to_string((int)enemyBase.x) + " " + to_string((int)enemyBase.y) + " ATK-CTRL";
                    myMana -= 10;
                    acted = true;
                }
            }

            // --- Fallback WIND: single monster if close enough ---
            if (!acted && myMana >= 10) {
                for (int i = 0; i < (int)monsters.size(); i++) {
                    auto& m = monsters[i];
                    if (heroes[a].pos.dist(m.pos) > WIND_RANGE) continue;
                    if (m.shieldLife > 0) continue;
                    if (m.pos.dist(enemyBase) < 7000) {
                        cmd[a] = "SPELL WIND " + to_string((int)enemyBase.x) + " " + to_string((int)enemyBase.y) + " ATK-WIND";
                        myMana -= 10;
                        acted = true;
                        break;
                    }
                }
            }
        }

        if (!acted) {
            if (earlyGame) {
                // Farm aggressively — chase monsters up to 8000 range
                int bestM = -1; double bestD = 1e18;
                for (int i = 0; i < (int)monsters.size(); i++) {
                    if (monTaken[i]) continue;
                    auto& m = monsters[i];
                    if (m.threatFor == 1 && m.pos.dist(myBase) < 6000) continue;
                    double d = heroes[a].pos.dist(m.pos);
                    if (d < bestD) { bestD = d; bestM = i; }
                }
                if (bestM >= 0 && bestD < 8000) {
                    auto& m = monsters[bestM];
                    cmd[a] = "MOVE " + to_string((int)(m.pos.x + m.vel.x)) + " " + to_string((int)(m.pos.y + m.vel.y)) + " farm";
                } else {
                    cmd[a] = "MOVE " + to_string((int)atkFarmSpot.x) + " " + to_string((int)atkFarmSpot.y) + " roam";
                }
            } else {
                // Herd monsters near enemy base, or move to camp
                int bestM = -1; double bestD = 1e18;
                for (int i = 0; i < (int)monsters.size(); i++) {
                    auto& m = monsters[i];
                    double d = heroes[a].pos.dist(m.pos);
                    double de = m.pos.dist(enemyBase);
                    // Chase monsters near enemy base to push them in
                    if (de < 8000 && d < 4000 && m.shieldLife == 0) {
                        if (d < bestD) { bestD = d; bestM = i; }
                    }
                }
                if (bestM >= 0) {
                    auto& m = monsters[bestM];
                    cmd[a] = "MOVE " + to_string((int)(m.pos.x + m.vel.x)) + " " + to_string((int)(m.pos.y + m.vel.y)) + " herd";
                } else {
                    cmd[a] = "MOVE " + to_string((int)atkCamp.x) + " " + to_string((int)atkCamp.y) + " camp";
                }
            }
        }
        used[a] = true;

        for (int i = 0; i < 3; i++) cout << cmd[i] << endl;
    }
}
