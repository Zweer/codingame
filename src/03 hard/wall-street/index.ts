// Define interfaces for better type safety and readability
interface Order {
    id: number; // Unique ID for FIFO tie-breaking
    symbol: string;
    verb: 'BUY' | 'SELL';
    qty: number;
    price: number;
}

interface Trade {
    symbol: string;
    qty: number;
    price: number;
}

/**
 * Formats a number to exactly two decimal places, ensuring minimal integral figures.
 * E.g., 10 -> "10.00", 0.5 -> "0.50".
 * @param price The number to format.
 * @returns The formatted string.
 */
function formatPrice(price: number): string {
    return price.toFixed(2);
}

/**
 * Processes a new order by attempting to match it with existing orders in the book.
 * Any remaining quantity of the new order is then added to the order book.
 * @param newOrder The incoming order to process.
 * @param orderBook The global map holding buy and sell orders for all symbols.
 * @param trades An array to store all completed trades in order of occurrence.
 */
function processOrder(newOrder: Order, orderBook: Map<string, { buys: Order[], sells: Order[] }>, trades: Trade[]): void {
    // Ensure the symbol exists in the order book, otherwise initialize it.
    let symbolBook = orderBook.get(newOrder.symbol);
    if (!symbolBook) {
        symbolBook = { buys: [], sells: [] };
        orderBook.set(newOrder.symbol, symbolBook);
    }

    if (newOrder.verb === 'BUY') {
        // For a BUY order, look for matching SELL orders
        // Iterate while the new order still has quantity AND there are sell orders available
        while (newOrder.qty > 0 && symbolBook.sells.length > 0) {
            const bestSellOrder = symbolBook.sells[0]; // Best SELL is the one with the lowest price (first in sorted array)

            // A trade can occur if the buyer's price is greater than or equal to the seller's price
            if (newOrder.price >= bestSellOrder.price) {
                // The trade price is the price of the order already in the system (the sell order's price)
                const tradePrice = bestSellOrder.price;
                // The quantity traded is the minimum of the two orders' quantities
                const tradedQty = Math.min(newOrder.qty, bestSellOrder.qty);

                trades.push({ symbol: newOrder.symbol, qty: tradedQty, price: tradePrice });

                // Reduce quantities for both orders
                newOrder.qty -= tradedQty;
                bestSellOrder.qty -= tradedQty;

                // If the sell order is fully consumed, remove it from the book
                if (bestSellOrder.qty === 0) {
                    symbolBook.sells.shift(); // Remove from the front of the array (O(M) operation)
                }
            } else {
                // The new buy order's price is too low to match the best sell order.
                // Since sell orders are sorted by increasing price, no other sell orders will match.
                break;
            }
        }

        // If the new BUY order still has remaining quantity after all attempts, add it to the book
        if (newOrder.qty > 0) {
            symbolBook.buys.push(newOrder);
            // Re-sort the BUY orders:
            // 1. Highest price first (descending)
            // 2. Then by FIFO (ascending ID) for orders with the same price
            symbolBook.buys.sort((a, b) => {
                if (b.price !== a.price) {
                    return b.price - a.price;
                }
                return a.id - b.id;
            });
        }
    } else { // newOrder.verb === 'SELL'
        // For a SELL order, look for matching BUY orders
        // Iterate while the new order still has quantity AND there are buy orders available
        while (newOrder.qty > 0 && symbolBook.buys.length > 0) {
            const bestBuyOrder = symbolBook.buys[0]; // Best BUY is the one with the highest price (first in sorted array)

            // A trade can occur if the seller's price is less than or equal to the buyer's price
            if (newOrder.price <= bestBuyOrder.price) {
                // The trade price is the price of the order already in the system (the buy order's price)
                const tradePrice = bestBuyOrder.price;
                // The quantity traded is the minimum of the two orders' quantities
                const tradedQty = Math.min(newOrder.qty, bestBuyOrder.qty);

                trades.push({ symbol: newOrder.symbol, qty: tradedQty, price: tradePrice });

                // Reduce quantities for both orders
                newOrder.qty -= tradedQty;
                bestBuyOrder.qty -= tradedQty;

                // If the buy order is fully consumed, remove it from the book
                if (bestBuyOrder.qty === 0) {
                    symbolBook.buys.shift(); // Remove from the front of the array (O(M) operation)
                }
            } else {
                // The new sell order's price is too high to match the best buy order.
                // Since buy orders are sorted by decreasing price, no other buy orders will match.
                break;
            }
        }

        // If the new SELL order still has remaining quantity after all attempts, add it to the book
        if (newOrder.qty > 0) {
            symbolBook.sells.push(newOrder);
            // Re-sort the SELL orders:
            // 1. Lowest price first (ascending)
            // 2. Then by FIFO (ascending ID) for orders with the same price
            symbolBook.sells.sort((a, b) => {
                if (a.price !== b.price) {
                    return a.price - b.price;
                }
                return a.id - b.id;
            });
        }
    }
}

/**
 * Main function to solve the Wall Street puzzle.
 * Reads input, processes orders, and prints the trade results.
 */
function solve() {
    // Read the total number of orders
    const N: number = parseInt(readline());

    // Initialize the global order book and the list of trades
    const orderBook = new Map<string, { buys: Order[], sells: Order[] }>();
    const trades: Trade[] = [];
    let orderIdCounter = 0; // Used to assign unique IDs for FIFO ordering

    // Process each incoming order
    for (let i = 0; i < N; i++) {
        const inputs = readline().split(' ');
        const symbol: string = inputs[0];
        const verb: 'BUY' | 'SELL' = inputs[1] as 'BUY' | 'SELL';
        const qty: number = parseInt(inputs[2]);
        const price: number = parseFloat(inputs[3]);

        // Create a new Order object with a unique ID
        const newOrder: Order = { id: orderIdCounter++, symbol, verb, qty, price };
        processOrder(newOrder, orderBook, trades);
    }

    // Output the results based on whether any trades occurred
    if (trades.length === 0) {
        print("NO TRADE");
    } else {
        trades.forEach(trade => {
            print(`${trade.symbol} ${trade.qty} ${formatPrice(trade.price)}`);
        });
    }
}

// Call the main solve function to start the program execution
solve();