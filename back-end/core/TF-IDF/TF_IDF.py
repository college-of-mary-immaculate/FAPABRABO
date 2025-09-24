import pandas as pd

docA = "The cat sat on my face"
docB = "The dog sat on my bed"

bowA = docA.split(" ")
bowB = docB.split(" ")
print("This is bowA", bowA)
print("This is bowB" ,  bowB)

wordSet = set(bowA).union(set(bowB))

print(wordSet)

wordDictA = dict.fromkeys(wordSet, 0) 
wordDictB = dict.fromkeys(wordSet, 0) 

print("This is wordDictA",  wordDictA)
print("This is wordDictB", wordDictB)

for word in bowA:
    wordDictA[word]+=1
    
for word in bowB:
    wordDictB[word]+=1
    
print("This is wordDictA", wordDictA)
print("This is wordDictB",wordDictB)


pd.DataFrame([wordDictA, wordDictB])


# The function computeTF computes the TF score for each word in the corpus, by document.
def computeTF(wordDict, bow):
    tfDict = {}
    bowCount = len(bow)
    for word, count in wordDict.items():
        tfDict[word] = count/float(bowCount)
    return tfDict

tfBowA = computeTF(wordDictA, bowA)
tfBowB = computeTF(wordDictB, bowB)

print("This is tfBowA", tfBowA)
print("This is tfBow", tfBowB)

# The function computeIDF computes the IDF score of every word in the corpus.
def computeIDF(docList):
    import math
    idfDict = {}
    N = len(docList)
    
    idfDict = dict.fromkeys(docList[0].keys(), 0)
    for doc in docList:
        for word, val in doc.items():
            if val > 0:
                idfDict[word] += 1
    
    for word, val in idfDict.items():
        idfDict[word] = math.log10(N / float(val))
        
    return idfDict 

idfs = computeIDF([wordDictA, wordDictB])

# The function computeTFIDF below computes the TF-IDF score for each word, by multiplying the TF and IDF scores.
def computeTFIDF(tfBow, idfs):
    tfidf = {}
    for word, val in tfBow.items():
        tfidf[word] = val*idfs[word]
    return tfidf
    
    
tfidfBowA = computeTFIDF(tfBowA, idfs)
tfidfBowB = computeTFIDF(tfBowB, idfs)

print("This is tfidfBowA", tfidfBowA)
print("This is tfidfBowB", tfidfBowB)

pd.DataFrame([tfidfBowA, tfidfBowB])