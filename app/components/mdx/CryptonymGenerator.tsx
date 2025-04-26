'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import nlp from 'compromise';

export function CryptonymGenerator() {
    const [digraph, setDigraph] = useState('');
    const [maxLength, setMaxLength] = useState(8);
    const [useDigraph, setUseDigraph] = useState(false);
    const [totalWords, setTotalWords] = useState(26);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // Fetch the nouns.json file
            const response = await fetch('/blog/cryptonyms/nouns.json');
            const data = await response.json();
            const nouns = data.nouns;
            
            // Filter nouns by max length if specified
            const filteredNouns = nouns.filter((noun: string) => 
                noun.length <= maxLength
            );
            
            // Filter out proper nouns using compromise.js
            const commonNouns = filteredNouns.filter((noun: string) => {
                // Use compromise to analyze the word
                const doc = nlp(noun);
                // Check if it's a proper noun using the #ProperNoun tag
                const isProperNoun = doc.match('#ProperNoun').length > 0 && 
                    // Exclude words that are always capitalized like "I" or "Monday"
                    !['i', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 
                      'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 
                      'september', 'october', 'november', 'december'].includes(noun.toLowerCase()) &&
                    // Also exclude words tagged as WeekDay or Date
                    !doc.match('#WeekDay').length && !doc.match('#Date').length;
                return !isProperNoun;
            });
            
            // Create a map of nouns by first letter
            const nounsByLetter: Record<string, string[]> = {};
            commonNouns.forEach((noun: string) => {
                const firstLetter = noun.charAt(0).toUpperCase();
                if (!nounsByLetter[firstLetter]) {
                    nounsByLetter[firstLetter] = [];
                }
                nounsByLetter[firstLetter].push(noun);
            });
            
            // Generate cryptonyms
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            const result: Record<string, string[]> = {};
            const usedWords = new Set<string>(); // Track used words to prevent duplicates
            
            // Initialize result with empty arrays for each letter
            alphabet.forEach(letter => {
                result[letter] = [];
            });
            
            // Fill in words randomly
            let wordsGenerated = 0;
            let currentLetterIndex = 0;
            
            while (wordsGenerated < totalWords) {
                const letter = alphabet[currentLetterIndex];
                
                // Add a random word for this letter if available
                if (nounsByLetter[letter] && nounsByLetter[letter].length > 0) {
                    const availableWords = nounsByLetter[letter].filter(word => !usedWords.has(word));
                    if (availableWords.length > 0) {
                        const randomIndex = Math.floor(Math.random() * availableWords.length);
                        const selectedWord = availableWords[randomIndex];
                        result[letter].push(selectedWord);
                        usedWords.add(selectedWord);
                        wordsGenerated++;
                    }
                }
                
                // Move to the next letter, looping back to the beginning if needed
                currentLetterIndex = (currentLetterIndex + 1) % alphabet.length;
            }
            
            // Format the result as a string - only the words, in alphabetical order
            const formattedResult = Object.entries(result)
                .sort(([a], [b]) => a.localeCompare(b)) // Sort by letter
                .map(([, words]) => words.map(word => {
                    // Apply digraph prefix if enabled
                    const upperWord = word.toUpperCase();
                    return useDigraph && digraph.length === 2 
                        ? `${digraph.toUpperCase()}${upperWord}`
                        : upperWord;
                }).join('\n'))
                .filter(word => word.length > 0) // Remove empty entries
                .join('\n');
            
            setResult(formattedResult);
        } catch (error) {
            console.error('Error generating cryptonyms:', error);
            setResult('Error generating cryptonyms. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (result) {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleBadgeClick = (value: number) => {
        setTotalWords(value);
    };

    return (
        <div className="p-6 bg-card rounded-xl border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="digraph" className="text-sm font-medium">
                            Digraph
                        </label>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="use-digraph"
                                checked={useDigraph}
                                onCheckedChange={setUseDigraph}
                            />
                            <label htmlFor="use-digraph" className="text-sm text-muted-foreground">
                                Use Digraph
                            </label>
                        </div>
                    </div>
                    <Input
                        id="digraph"
                        type="text"
                        maxLength={2}
                        value={digraph}
                        onChange={(e) => setDigraph(e.target.value.toUpperCase())}
                        placeholder="AB"
                        required={useDigraph}
                        disabled={!useDigraph}
                    />
                </div>
                
                <div className="space-y-2">
                    <label htmlFor="maxLength" className="text-sm font-medium">
                        Max Word Length
                    </label>
                    <Input
                        id="maxLength"
                        type="number"
                        min={1}
                        max={20}
                        value={maxLength}
                        onChange={(e) => setMaxLength(Number(e.target.value))}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="totalWords" className="text-sm font-medium">
                            Total Words to Generate
                        </label>
                        <div className="flex gap-1">
                            <Badge 
                                variant={totalWords === 26 ? "default" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => handleBadgeClick(26)}
                            >
                                1x
                            </Badge>
                            <Badge 
                                variant={totalWords === 52 ? "default" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => handleBadgeClick(52)}
                            >
                                2x
                            </Badge>
                            <Badge 
                                variant={totalWords === 78 ? "default" : "outline"} 
                                className="cursor-pointer"
                                onClick={() => handleBadgeClick(78)}
                            >
                                3x
                            </Badge>
                        </div>
                    </div>
                    <Input
                        id="totalWords"
                        type="number"
                        min={1}
                        max={100}
                        value={totalWords}
                        onChange={(e) => setTotalWords(Number(e.target.value))}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
                    disabled={isLoading}
                >
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </form>
            
            {result && (
                <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2 text-muted-foreground">Generated Cryptonyms:</h3>
                    <div className="relative">
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Copy to clipboard"
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                            <code>{result}</code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}