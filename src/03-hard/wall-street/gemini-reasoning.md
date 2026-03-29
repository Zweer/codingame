The puzzle "Wall Street" simulates a simplified stock exchange where buy and sell orders are matched to create trades. Orders that cannot be matched immediately are placed into an "order book."

Here's a breakdown of the rules and the approach to solve this in TypeScript:

**1. Order and Trade Definition:**

*   An `Order` consists of a `symbol` (stock identifier), `verb` (BUY or SELL), `qty` (quantity), and `price`.
*   To handle First-In-First-Out (FIFO) for orders at the same price, we'll assign a unique `id` to each incoming order based on its processing sequence.
*   A `Trade` records the `symbol`, `qty`, and `price` of a completed transaction.

**2. The Order Book Structure:**

*   The order book needs to store buy and sell orders separately for each stock `symbol`.
*   We'll use a `Map<string, { buys: Order[], sells: Order[] }>` where the key is the `symbol`.
*   **Buy Orders (`buys` array):** Must be sorted to prioritize the *highest* price first. For orders with the same price, the one that arrived earlier (smaller `id`) comes first (FIFO). So, sort descending by price, then ascending by ID.
*   **Sell Orders (`sells` array):** Must be sorted to prioritize the *lowest* price first. For orders with the same price, the one that arrived earlier (smaller `id`) comes first. So, sort ascending by price, then ascending by ID.

**3. Order Processing Logic:**

When a new order arrives:

*   **Initialize Symbol Book:** If no book exists for the order's `symbol`, create an empty one.
*   **Attempt to Trade:**
    *   **If the new order is a `BUY`:** Iterate through the existing `SELL` orders for that `symbol` (which are already sorted by best price: lowest first).
        *   A trade can occur if `newBuyOrder.price >= bestSellOrder.price`.
        *   **Trade Price:** If a trade occurs, the price used is the price of the order *already in the system* (the `bestSellOrder.price` in this case). This adheres to the rule "If the buyer's price is higher than the seller's price: the price used is the one already in the system."
        *   **Trade Quantity:** The trade quantity is the minimum of the `newBuyOrder.qty` and `bestSellOrder.qty`.
        *   Record the trade.
        *   Reduce quantities for both orders.
        *   If the `bestSellOrder.qty` becomes 0, remove it from the book.
        *   Continue this process as long as the `newBuyOrder` has remaining quantity and matching `SELL` orders exist.
    *   **If the new order is a `SELL`:** Iterate through the existing `BUY` orders for that `symbol` (sorted by best price: highest first).
        *   A trade can occur if `newSellOrder.price <= bestBuyOrder.price`.
        *   **Trade Price:** The price used is the price of the order *already in the system* (the `bestBuyOrder.price` in this case).
        *   **Trade Quantity:** Similar to buy orders, take the minimum quantity.
        *   Record the trade.
        *   Reduce quantities.
        *   If the `bestBuyOrder.qty` becomes 0, remove it from the book.
        *   Continue matching until the `newSellOrder` has no remaining quantity or no more matching `BUY` orders exist.
*   **Add Remaining Quantity to Book:** If the `newOrder` still has quantity left after attempting all possible trades, add its remaining part to the appropriate side of the order book (`buys` or `sells` array).
*   **Maintain Sort Order:** After adding a new order to the book, re-sort the relevant array (`buys` or `sells`) to maintain the best-price-first, then FIFO ordering. While `Array.prototype.sort()` might seem inefficient for repeated calls, given the constraint `N <= 1000`, its `O(M log M)` complexity (where M is book size) should be acceptable, leading to an overall complexity of roughly `O(N^2 log N)`.

**4. Output:**

*   Collect all successful trades in an array.
*   If the array is empty after processing all orders, print "NO TRADE".
*   Otherwise, print each trade in the format `SYMBOL QUANTITY PRICE`. Prices must be formatted to exactly two decimal places (e.g., `10.00`, `0.01`).

**TypeScript Implementation Details:**

*   Use `parseFloat()` for prices and `parseInt()` for quantities.
*   `toFixed(2)` method for number formatting to ensure two decimal places.
*   `Map` for the `orderBook` to easily access orders by symbol.